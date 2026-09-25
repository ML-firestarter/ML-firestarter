/**
 * The certificate page (CertificateView.astro). Every certificate's address serves this page
 * (netlify.toml), which takes the certificate's id from the address, reads the certificate from
 * the public certificates repository, checks the site's signature on it with the public keys the
 * page holds, and shows it. The reader it was issued to also gets the badge to add to their
 * GitHub profile and a link that adds the certificate to their LinkedIn profile.
 */
import { certificateFile, isCertificateId, readJws, type Certificate, type CertificateKey, type Titles } from '../lib/certificates.ts';
import { DEFAULT_LANG, isLang, localizeUrl, type Lang, type ui } from '../lib/i18n.ts';
import { CERTIFICATES_PATH, badgeUrl, certificateUrl, examUrl } from '../lib/paths.ts';
import { readReader } from './account.ts';
import { percent } from './scores.ts';

type Strings = (typeof ui)['en']['certificates']['script'] & {
  lang: Lang;
  /** The site's title. */
  site: string;
  /** The certificates repository, as `owner/name`. */
  repo: string;
  /** Language-neutral URLs of the site's pages, to link the chapter, lessons and exam a certificate names while they exist. */
  pages: string[];
  /** The public keys the site signs certificates with; none when it was built without CERTIFICATE_KEY. */
  keys: CertificateKey[];
  /** Where the site publishes them. */
  keysUrl: string;
};

type State = 'loading' | 'none' | 'missing' | 'invalid' | 'failed' | 'shown';

/** How far the page could check a certificate's signature: `valid`, or why it couldn't tell. */
type Signature = 'valid' | 'noKey' | 'unsupported';

/** How long to wait before looking again for a certificate that isn't there, in ms: one just published can take a moment to show up. */
const RETRIES = [1000, 2500];

const page = document.querySelector<HTMLElement>('[data-certificate-page]');
if (page) setUpCertificate(page);

function setUpCertificate(page: HTMLElement) {
  const t: Strings = JSON.parse(page.querySelector('[data-certificate-strings]')!.textContent!);
  const home = localizeUrl(CERTIFICATES_PATH, t.lang);
  const id = location.pathname.startsWith(home) ? location.pathname.slice(home.length).replace(/\/$/, '') : '';
  const dates = new Intl.DateTimeFormat(t.lang, { dateStyle: 'long' });
  const date = (iso: string) => dates.format(new Date(iso));
  const part = <T extends HTMLElement = HTMLElement>(name: string) => page.querySelector<T>(`[data-certificate-${name}]`)!;
  /** A title in the page's language, or the original. */
  const title = (titles: Titles) => titles[t.lang] ?? titles[DEFAULT_LANG] ?? Object.values(titles)[0] ?? '';
  /** A page of the site in this language, while the site still has it. */
  const pageUrl = (path: string) => (t.pages.includes(path) ? localizeUrl(path, t.lang) : undefined);

  function show(state: State) {
    for (const el of page.querySelectorAll<HTMLElement>('[data-state]')) el.hidden = el.dataset.state !== state;
  }

  async function load() {
    show('loading');
    if (!id) return show('none');
    if (!isCertificateId(id)) return show('missing');
    try {
      const file = await fetchFile();
      if (file === undefined) return show('missing');
      const checked = await check(file, id, t.keys);
      if (!checked) return show('invalid');
      paint(checked.certificate, checked.signature);
      show('shown');
    } catch {
      show('failed');
    }
  }

  /** The certificate's file in the repository, or undefined when there's none with this id. */
  async function fetchFile(): Promise<unknown> {
    for (let tries = 0; ; tries++) {
      const response = await fetch(certificateFile(t.repo, id).raw);
      if (response.ok) return response.json().catch(() => null);
      if (response.status !== 404) throw new Error(`GitHub answered ${response.status}`);
      if (tries === RETRIES.length) return undefined;
      await new Promise((resolve) => setTimeout(resolve, RETRIES[tries]));
    }
  }

  function paint(certificate: Certificate, signature: Signature) {
    const { reader, passed } = certificate;
    const name = reader.name || `@${reader.login}`;
    document.title = `${t.pageTitle.replace('{name}', name)} · ${t.site}`;
    part<HTMLImageElement>('avatar').src = `https://avatars.githubusercontent.com/u/${reader.id}?s=176`;
    part('name').textContent = name;
    link(part('login'), `@${reader.login}`, `https://github.com/${reader.login}`);
    link(part('chapter'), title(certificate.title), pageUrl(certificate.chapter));
    const score = { date: date(passed.at), score: percent(passed.score), right: String(passed.right), questions: String(passed.questions) };
    fill(part('passed'), t.passed, score);
    part('lessons').replaceChildren(
      ...certificate.lessons.map((lesson) => {
        const item = document.createElement('li');
        item.append(link(document.createElement('a'), title(lesson.title), pageUrl(lesson.path)));
        return item;
      }),
    );
    const file = certificateFile(t.repo, id);
    fill(part('issued'), t.issued, { date: date(certificate.issued), repo: link(document.createElement('a'), t.repo, `https://github.com/${t.repo}`) });
    const checked = part('signature');
    checked.classList.toggle('is-valid', signature === 'valid');
    if (signature === 'valid') fill(checked, t.signature.valid, { key: link(document.createElement('a'), t.signature.key, t.keysUrl) });
    else checked.textContent = t.signature[signature];
    part('id').textContent = t.id.replace('{id}', id);
    part<HTMLAnchorElement>('file').href = file.page;
    part<HTMLAnchorElement>('history').href = file.history;

    // The same certificate in the other languages.
    for (const other of document.querySelectorAll<HTMLAnchorElement>('a.lang-link')) {
      if (isLang(other.hreflang)) other.href = localizeUrl(certificateUrl(id), other.hreflang);
    }
    // Only the reader it was issued to gets the badge and the link for their profiles.
    const isTheirs = readReader()?.login.toLowerCase() === reader.login.toLowerCase();
    if (isTheirs) paintShare(certificate);
    part('share').hidden = !isTheirs;
  }

  /** The badge for the reader's profile README, as Markdown linking it to this page, and the link that adds the certificate to LinkedIn. */
  function paintShare(certificate: Certificate) {
    const profile = `${certificate.reader.login}/${certificate.reader.login}`;
    const badge = new URL(localizeUrl(badgeUrl(certificate.chapter), t.lang), location.origin).href;
    const here = new URL(localizeUrl(certificateUrl(id), t.lang), location.origin).href;
    const alt = t.share.alt.replace('{site}', t.site).replace('{chapter}', title(certificate.title));
    fill(part('share-text'), t.share.text, { repo: link(document.createElement('a'), profile, `https://github.com/${profile}`) });
    const img = part<HTMLImageElement>('badge');
    img.src = badge;
    img.alt = alt;
    part('snippet').textContent = `[![${alt.replace(/[[\]\\]/g, '\\$&')}](${badge})](${here})`;

    // LinkedIn's "Add to profile" link for certifications, with the site as the issuing organization.
    const issued = new Date(certificate.issued);
    const linkedin = new URL('https://www.linkedin.com/profile/add');
    linkedin.search = new URLSearchParams({
      startTask: 'CERTIFICATION_NAME',
      name: t.share.linkedinName.replace('{chapter}', title(certificate.title)),
      organizationName: t.site,
      issueYear: String(issued.getUTCFullYear()),
      issueMonth: String(issued.getUTCMonth() + 1),
      certUrl: here,
      certId: id,
    }).toString();
    part<HTMLAnchorElement>('linkedin').href = linkedin.href;

    // Unpublishing is on the exam's page, while the site has the exam.
    const exam = pageUrl(examUrl(certificate.chapter));
    const manage = part('manage');
    if (exam) fill(manage, t.share.manage, { exam: link(document.createElement('a'), t.share.exam, exam) });
    manage.hidden = !exam;
  }

  part('copy').addEventListener('click', async () => {
    const button = part<HTMLButtonElement>('copy');
    const snippet = part('snippet');
    try {
      await navigator.clipboard.writeText(snippet.textContent ?? '');
      button.querySelector('[data-label]')!.textContent = t.share.copied;
      setTimeout(() => (button.querySelector('[data-label]')!.textContent = t.share.copy), 2000);
    } catch {
      // No clipboard, as on plain HTTP: select the snippet to copy it by hand.
      getSelection()?.selectAllChildren(snippet);
    }
  });
  part('retry').addEventListener('click', load);

  load();
}

/**
 * The certificate a file of the certificates repository holds, as the site signed it, and how
 * far its signature could be checked; undefined when it isn't one the site signed. Only the
 * signed certificate counts, not the copy next to it that's there to read on GitHub.
 */
async function check(file: unknown, id: string, keys: CertificateKey[]): Promise<{ certificate: Certificate; signature: Signature } | undefined> {
  const signed = typeof file === 'object' && file !== null ? (file as { jws?: unknown }).jws : undefined;
  const jws = typeof signed === 'string' ? readJws(signed) : undefined;
  const certificate = jws && readCertificate(jws.payload, id);
  if (!jws || !certificate || jws.header.alg !== 'EdDSA') return undefined;
  // A copy of the site built without the key, like a deploy preview, can't tell.
  if (keys.length === 0) return { certificate, signature: 'noKey' };
  const key = keys.find((candidate) => candidate.kid === jws.header.kid);
  if (!key) return undefined;
  let valid: boolean;
  try {
    const publicKey = await crypto.subtle.importKey('jwk', { kty: key.kty, crv: key.crv, x: key.x }, { name: 'Ed25519' }, false, ['verify']);
    valid = await crypto.subtle.verify({ name: 'Ed25519' }, publicKey, jws.signature, new TextEncoder().encode(jws.input));
  } catch {
    // Browsers without Ed25519 in Web Crypto.
    return { certificate, signature: 'unsupported' };
  }
  return valid ? { certificate, signature: 'valid' } : undefined;
}

/** An anchor with `text`, linked to `href` when there's one. */
function link(anchor: HTMLAnchorElement, text: string, href?: string): HTMLAnchorElement {
  anchor.textContent = text;
  if (href) anchor.href = href;
  else anchor.removeAttribute('href');
  return anchor;
}

/** Fills `el` with `template`, putting each of `parts` in place of its `{name}`: text, or an element. */
function fill(el: HTMLElement, template: string, parts: Record<string, string | Node>) {
  el.replaceChildren(
    ...template.split(/(\{\w+\})/).map((piece) => {
      const value = /^\{\w+\}$/.test(piece) ? parts[piece.slice(1, -1)] : undefined;
      return value === undefined ? piece : value;
    }),
  );
}

/** `data` as the certificate `id`, or undefined when it isn't one. */
function readCertificate(data: unknown, id: string): Certificate | undefined {
  const certificate = data as Partial<Certificate> | null;
  const isTitles = (value: unknown) =>
    typeof value === 'object' && value !== null && Object.values(value).every((title) => typeof title === 'string');
  const { reader, passed, lessons } = certificate ?? {};
  const isValid =
    certificate?.id === id &&
    Number.isInteger(reader?.id) &&
    /^[A-Za-z0-9-]{1,39}$/.test(reader?.login ?? '') &&
    (reader?.name === undefined || typeof reader.name === 'string') &&
    typeof certificate.chapter === 'string' &&
    isTitles(certificate.title) &&
    Array.isArray(lessons) &&
    lessons.every((lesson) => typeof lesson?.path === 'string' && isTitles(lesson.title)) &&
    typeof passed?.at === 'string' &&
    typeof passed.score === 'number' &&
    typeof passed.right === 'number' &&
    typeof passed.questions === 'number' &&
    typeof certificate.issued === 'string';
  return isValid ? (certificate as Certificate) : undefined;
}
