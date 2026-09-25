/**
 * The certificate page (CertificateView.astro). Every certificate's address serves this page
 * (netlify.toml), which takes the certificate's id from the address, reads the certificate from
 * the public certificates repository and shows it. The reader it was issued to also gets the
 * badge to add to their GitHub profile.
 */
import { certificateFile, isCertificateId, type Certificate, type Titles } from '../lib/certificates.ts';
import { DEFAULT_LANG, isLang, localizeUrl, type Lang, type ui } from '../lib/i18n.ts';
import { CERTIFICATES_PATH, badgeUrl, certificateUrl } from '../lib/paths.ts';
import { readReader } from './account.ts';
import { percent } from './scores.ts';

type Strings = (typeof ui)['en']['certificates']['script'] & {
  lang: Lang;
  /** The site's title. */
  site: string;
  /** The certificates repository, as `owner/name`. */
  repo: string;
  /** Language-neutral URLs of the site's pages, to link the chapter and lessons a certificate names while they exist. */
  pages: string[];
};

type State = 'loading' | 'none' | 'missing' | 'failed' | 'shown';

/** How long to wait before looking again for a certificate that isn't there, in ms: one just issued can take a moment to show up. */
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
      const certificate = await fetchCertificate();
      if (!certificate) return show('missing');
      paint(certificate);
      show('shown');
    } catch {
      show('failed');
    }
  }

  /** The certificate from the repository, or undefined when there's none with this id. */
  async function fetchCertificate(): Promise<Certificate | undefined> {
    for (let tries = 0; ; tries++) {
      const response = await fetch(certificateFile(t.repo, id).raw);
      if (response.ok) return readCertificate(await response.json(), id);
      if (response.status !== 404) throw new Error(`GitHub answered ${response.status}`);
      if (tries === RETRIES.length) return undefined;
      await new Promise((resolve) => setTimeout(resolve, RETRIES[tries]));
    }
  }

  function paint(certificate: Certificate) {
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
    part('id').textContent = t.id.replace('{id}', id);
    part<HTMLAnchorElement>('file').href = file.page;
    part<HTMLAnchorElement>('history').href = file.history;

    // The same certificate in the other languages.
    for (const other of document.querySelectorAll<HTMLAnchorElement>('a.lang-link')) {
      if (isLang(other.hreflang)) other.href = localizeUrl(certificateUrl(id), other.hreflang);
    }
    // Only the reader it was issued to gets the badge for their profile.
    const isTheirs = readReader()?.login.toLowerCase() === reader.login.toLowerCase();
    if (isTheirs) paintShare(certificate);
    part('share').hidden = !isTheirs;
  }

  /** The badge for the reader's profile README, as Markdown linking it to this page. */
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
