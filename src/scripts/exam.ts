/**
 * The exam page (ExamView.astro). Starting an attempt has the API draw its questions, and the
 * reader's answers are kept in this browser's localStorage until they hand them in, so they
 * can leave and come back. Handing in has the API check the answers and keep the result. The
 * page never knows which answers are right: it gets the score and the lessons to read again.
 * A pass earns a certificate, which the API signs: once the reader has passed, the page lets
 * them publish it, and unpublish it, when the site signs certificates.
 */
import type { CertificateResponse, CertificateState } from '../lib/certificates.ts';
import type { ExamError, ExamRecord, StartResponse, SubmitResponse } from '../lib/exams.ts';
import { plural, type Lang, type ui } from '../lib/i18n.ts';
import { EXAM_ATTEMPTS_KEY, paintAccount, readReader } from './account.ts';
import { keepAttempt, keepCertificate, loadExams, paintExams } from './exams.ts';
import { percent } from './scores.ts';

type Strings = (typeof ui)['en']['exams']['script'] & {
  lang: Lang;
  /** The chapter's lessons with exam questions, by language-neutral URL, to link the ones to read again. */
  lessons: Record<string, { url: string; title: string; lang?: Lang }>;
  /** URL of the certificate page in the page's language; each certificate's page is under it. */
  certificates: string;
};

/** An attempt in progress. */
interface Saved {
  /** Whose attempt it is, in case someone else signs in on this browser. */
  login: string;
  /** Version of the questions it was drawn from. */
  version: string;
  /** The attempt as the API started it, sealed, with its questions; left out once it runs out, while the answers stay. */
  attempt?: string;
  questions?: string[];
  expires?: string;
  /** Positions of the answers picked, by question id. */
  answers: Record<string, number[]>;
}

type State = 'loading' | 'signed-out' | 'ready' | 'waiting' | 'passed' | 'error';

const page = document.querySelector<HTMLElement>('[data-exam-page]');
if (page) setUpExam(page);

function setUpExam(page: HTMLElement) {
  const chapter = page.dataset.examPage!;
  const key = page.dataset.examKey!;
  const version = page.dataset.examVersion!;
  const t: Strings = JSON.parse(page.querySelector('[data-exam-strings]')!.textContent!);
  const panel = page.querySelector<HTMLElement>('[data-exam-panel]')!;
  const panelError = panel.querySelector<HTMLElement>('[data-exam-error]')!;
  const startButton = panel.querySelector<HTMLButtonElement>('[data-exam-start]')!;
  const form = page.querySelector<HTMLFormElement>('[data-exam-form]')!;
  const formError = form.querySelector<HTMLElement>('[data-exam-form-error]')!;
  const handInButton = form.querySelector<HTMLButtonElement>('[data-exam-hand-in]')!;
  const answered = form.querySelector<HTMLElement>('[data-answered]')!;
  const result = page.querySelector<HTMLElement>('[data-result]')!;
  // Missing when the site doesn't sign certificates.
  const certificate = page.querySelector<HTMLElement>('[data-certificate]');
  const sections = new Map([...form.querySelectorAll<HTMLElement>('[data-question]')].map((section) => [section.dataset.question!, section]));
  const dates = new Intl.DateTimeFormat(t.lang, { dateStyle: 'long', timeStyle: 'short' });
  const date = (iso: string) => dates.format(new Date(iso));

  /** The attempt being answered, as it's kept; kept here too, for browsers that can't store it. */
  let current: Saved | undefined;
  /** The sections of its questions. */
  let drawn: HTMLElement[] = [];
  let busy = false;

  function show(state: State, message = '') {
    for (const el of panel.querySelectorAll<HTMLElement>('[data-state]')) el.hidden = el.dataset.state !== state;
    say(panelError, message);
    panel.hidden = false;
    form.hidden = true;
    result.hidden = true;
    if (certificate) certificate.hidden = true;
  }

  /**
   * Shows the reader who passed their certificate: the button that publishes it, or once it's
   * published, the link to its page and the button that unpublishes it.
   */
  function offerCertificate(state?: CertificateState, message = '') {
    if (!certificate) return;
    const published = Boolean(state?.published);
    certificate.querySelector<HTMLElement>('[data-certificate-unpublished]')!.hidden = published;
    certificate.querySelector<HTMLElement>('[data-certificate-published]')!.hidden = !published;
    if (state && published) certificate.querySelector<HTMLAnchorElement>('[data-certificate-link]')!.href = `${t.certificates}${state.id}/`;
    say(certificate.querySelector<HTMLElement>('[data-certificate-message]')!, message);
    say(certificate.querySelector<HTMLElement>('[data-certificate-error]')!, '');
    certificate.hidden = false;
  }

  /** Where the reader stands with the exam, as the API says. */
  async function refresh(message = '') {
    if (!readReader()) return show('signed-out', message);
    show('loading');
    const loaded = await loadExams(true);
    if ('error' in loaded) {
      if (loaded.error === 'signed-out') return show('signed-out', message);
      return show('error', loaded.error === 'rate-limited' ? t.errors.rateLimited : loaded.error === 'not-configured' ? t.errors.notConfigured : t.errors.generic);
    }
    paintExams(loaded.exams);
    const { attempts, next, certificate: kept }: ExamRecord = loaded.exams[chapter] ?? { attempts: [] };
    const passed = attempts.find((attempt) => attempt.passed);
    if (passed || next) forget();
    if (passed) {
      say(panel.querySelector<HTMLElement>('[data-exam-passed]')!, t.passed.replace('{date}', date(passed.at)).replace('{score}', percent(passed.score)));
      show('passed', message);
      return offerCertificate(kept);
    }
    if (next) {
      say(panel.querySelector<HTMLElement>('[data-exam-waiting]')!, t.waiting.replace('{date}', date(next)));
      return show('waiting', message);
    }
    const last = attempts.at(-1);
    say(panel.querySelector<HTMLElement>('[data-exam-last]')!, last ? t.last.replace('{score}', percent(last.score)) : '');

    current = readSaved(chapter);
    if (current && current.version !== version) {
      forget();
      return show('ready', t.errors.changed);
    }
    if (current?.attempt && Date.parse(current.expires ?? '') > Date.now()) return answer(current);
    // Starting again draws the same questions, and the answers carry over.
    if (current?.attempt) return expire();
    show('ready', message);
  }

  async function start() {
    if (busy) return;
    busy = true;
    startButton.disabled = true;
    label(startButton, t.starting);
    say(panelError, '');
    try {
      const response = await post('/api/exams/start', { key });
      if (!response.ok) return await refused(response, 'start');
      const started: StartResponse = await response.json();
      const login = readReader()?.login;
      if (!login) return show('signed-out');
      const answers = current?.version === version ? current.answers : {};
      current = {
        login,
        version,
        attempt: started.attempt,
        questions: started.questions,
        expires: started.expires,
        answers: Object.fromEntries(started.questions.flatMap((id) => (answers[id] ? [[id, answers[id]]] : []))),
      };
      writeSaved(chapter, current);
      answer(current);
      drawn[0]?.querySelector('input')?.focus({ preventScroll: true });
    } catch {
      show('ready', t.errors.generic);
    } finally {
      busy = false;
      startButton.disabled = false;
      label(startButton, t.start);
    }
  }

  /** Shows the questions of a started attempt, with the answers picked so far. */
  function answer(attempt: Saved) {
    const ids = attempt.questions ?? [];
    drawn = ids.flatMap((id) => sections.get(id) ?? []);
    if (drawn.length !== ids.length) {
      forget();
      return show('ready', t.errors.changed);
    }
    for (const [id, section] of sections) section.hidden = !ids.includes(id);
    for (const section of drawn) {
      const picked = attempt.answers[section.dataset.question!] ?? [];
      for (const input of section.querySelectorAll<HTMLInputElement>('input')) input.checked = picked.includes(Number(input.value));
    }
    say(form.querySelector<HTMLElement>('[data-exam-due]')!, t.due.replace('{date}', date(attempt.expires!)));
    say(formError, '');
    paintAnswered();
    panel.hidden = true;
    result.hidden = true;
    if (certificate) certificate.hidden = true;
    form.hidden = false;
  }

  async function handIn() {
    if (busy || !current?.attempt) return;
    const missing = drawn.filter((section) => !section.querySelector('input:checked'));
    if (missing.length > 0) {
      say(formError, plural(t.lang, missing.length, t.unanswered));
      missing[0].querySelector('input')?.focus();
      return;
    }
    busy = true;
    handInButton.disabled = true;
    label(handInButton, t.handingIn);
    say(formError, '');
    try {
      const response = await post('/api/exams/submit', { attempt: current.attempt, answers: picked() });
      if (!response.ok) return await refused(response, 'hand-in');
      const handedIn: SubmitResponse = await response.json();
      forget();
      keepAttempt(chapter, handedIn.result, handedIn.next);
      const kept = await loadExams();
      if ('exams' in kept) paintExams(kept.exams);
      showResult(handedIn);
    } catch {
      say(formError, t.errors.generic);
    } finally {
      busy = false;
      handInButton.disabled = false;
      label(handInButton, t.handIn);
    }
  }

  function showResult({ result: attempt, review, next, certificate: earned }: SubmitResponse) {
    result.classList.toggle('is-passed', attempt.passed);
    result.querySelector('[data-result-percent]')!.textContent = percent(attempt.score);
    result.querySelector('[data-result-count]')!.textContent = `${attempt.right}/${attempt.questions}`;
    say(result.querySelector<HTMLElement>('[data-result-next]')!, next ? t.waiting.replace('{date}', date(next)) : '');
    // Only when the site doesn't make readers wait between attempts.
    result.querySelector<HTMLElement>('[data-exam-again]')!.hidden = attempt.passed || Boolean(next);

    const lessons = review.flatMap((path) => t.lessons[path] ?? []);
    const links = lessons.map((lesson) => {
      const link = document.createElement('a');
      link.href = lesson.url;
      link.textContent = lesson.title;
      if (lesson.lang) link.lang = lesson.lang;
      const item = document.createElement('li');
      item.append(link);
      return item;
    });
    const reviewBox = result.querySelector<HTMLElement>('[data-result-review]')!;
    reviewBox.querySelector('ul')!.replaceChildren(...links);
    reviewBox.hidden = links.length === 0;

    panel.hidden = true;
    form.hidden = true;
    result.hidden = false;
    if (attempt.passed) offerCertificate(earned);
    result.focus();
  }

  /**
   * Publishes the reader's certificate, or unpublishes it. Publishing sends the exam's key, which
   * tells the API what the exam covers, for a pass from before the site signed certificates.
   */
  async function changeCertificate(button: HTMLButtonElement, publish: boolean) {
    if (busy || !certificate) return;
    busy = true;
    button.disabled = true;
    label(button, publish ? t.certificate.publishing : t.certificate.unpublishing);
    say(certificate.querySelector<HTMLElement>('[data-certificate-error]')!, '');
    try {
      const response = publish ? await send('POST', '/api/certificates', { key }) : await send('DELETE', '/api/certificates', { chapter });
      if (!response.ok) return await refused(response, 'certificate');
      const changed: CertificateResponse = await response.json();
      keepCertificate(chapter, changed.certificate);
      offerCertificate(changed.certificate, publish ? '' : t.certificate.unpublished);
      if (publish) certificate.querySelector<HTMLAnchorElement>('[data-certificate-link]')!.focus();
    } catch {
      say(certificate.querySelector<HTMLElement>('[data-certificate-error]')!, t.errors.generic);
    } finally {
      busy = false;
      button.disabled = false;
      label(button, publish ? t.certificate.publish : t.certificate.unpublish);
    }
  }

  /** What the page does when the API won't start or take an attempt, or change the certificate. */
  async function refused(response: Response, during: 'start' | 'hand-in' | 'certificate') {
    const data: Partial<ExamError> = await response.json().catch(() => ({}));
    const error = data.error ?? (response.status === 429 ? 'rate-limited' : 'server');
    const problem = (message: string) =>
      during === 'start'
        ? show('ready', message)
        : say(during === 'hand-in' || !certificate ? formError : certificate.querySelector<HTMLElement>('[data-certificate-error]')!, message);
    switch (error) {
      case 'signed-out':
        // The answers stay, for when the reader signs in again.
        paintAccount();
        return show('signed-out', t.errors.signedOut);
      case 'expired':
        return expire();
      case 'handed-in':
        forget();
        return refresh(t.errors.handedIn);
      case 'waiting':
      case 'passed':
      case 'not-passed':
        forget();
        return refresh();
      case 'outdated':
        return show('error', during === 'certificate' ? t.certificate.outdated : t.errors.outdated);
      case 'not-configured':
        return during === 'certificate' ? problem(t.certificate.notConfigured) : show('error', t.errors.notConfigured);
      case 'rate-limited':
        return problem(t.errors.rateLimited);
      default:
        return problem(t.errors.generic);
    }
  }

  /** The attempt ran out: starting again draws the same questions, and the answers carry over. */
  function expire() {
    if (current) {
      current = { login: current.login, version: current.version, answers: current.answers };
      writeSaved(chapter, current);
    }
    show('ready', t.errors.expired);
  }

  function forget() {
    current = undefined;
    drawn = [];
    removeSaved(chapter);
  }

  function paintAnswered() {
    const count = drawn.filter((section) => section.querySelector('input:checked')).length;
    answered.textContent = `${count}/${drawn.length}`;
  }

  /** Positions of the answers picked, by question id. */
  function picked(): Record<string, number[]> {
    return Object.fromEntries(
      drawn.map((section) => [
        section.dataset.question!,
        [...section.querySelectorAll<HTMLInputElement>('input:checked')].map((input) => Number(input.value)),
      ]),
    );
  }

  form.addEventListener('change', () => {
    if (current) {
      current = { ...current, answers: picked() };
      writeSaved(chapter, current);
    }
    paintAnswered();
    say(formError, '');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    handIn();
  });
  startButton.addEventListener('click', start);
  for (const publish of [true, false]) {
    const button = certificate?.querySelector<HTMLButtonElement>(publish ? '[data-certificate-publish]' : '[data-certificate-unpublish]');
    button?.addEventListener('click', () => changeCertificate(button, publish));
  }
  panel.querySelector('[data-exam-reload]')!.addEventListener('click', () => location.reload());
  result.querySelector('[data-exam-again]')!.addEventListener('click', () => refresh());
  // The back button can bring back the page as it was left, before signing in or handing in in another tab.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) refresh();
  });

  refresh();
}

function say(el: HTMLElement, message: string) {
  el.textContent = message;
  el.hidden = !message;
}

function label(button: HTMLButtonElement, text: string) {
  button.querySelector('[data-label]')!.textContent = text;
}

function post(url: string, body: unknown): Promise<Response> {
  return send('POST', url, body);
}

function send(method: 'POST' | 'DELETE', url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
}

// ---------- Attempts in progress, by chapter; storage can be unavailable, as in private windows ----------

function readAll(): Record<string, Saved> {
  try {
    const all: unknown = JSON.parse(localStorage.getItem(EXAM_ATTEMPTS_KEY) ?? '{}');
    return all && typeof all === 'object' && !Array.isArray(all) ? (all as Record<string, Saved>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, Saved>) {
  try {
    if (Object.keys(all).length > 0) localStorage.setItem(EXAM_ATTEMPTS_KEY, JSON.stringify(all));
    else localStorage.removeItem(EXAM_ATTEMPTS_KEY);
  } catch {
    // Not kept: the attempt lasts as long as the page.
  }
}

/** The signed-in reader's attempt at a chapter's exam, if they have one in progress. */
function readSaved(chapter: string): Saved | undefined {
  const saved: Partial<Saved> | undefined = readAll()[chapter];
  const login = readReader()?.login;
  const isSaved = saved?.login === login && typeof saved?.version === 'string' && typeof saved.answers === 'object' && saved.answers !== null;
  return isSaved ? (saved as Saved) : undefined;
}

function writeSaved(chapter: string, saved: Saved) {
  writeAll({ ...readAll(), [chapter]: saved });
}

function removeSaved(chapter: string) {
  const all = readAll();
  delete all[chapter];
  writeAll(all);
}
