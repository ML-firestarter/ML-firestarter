/**
 * Test scores, kept in this browser's localStorage by the tested lesson's
 * language-neutral path, so they carry over between languages like lesson progress.
 */
import { site } from '../site.config.ts';

export const SCORES_KEY = 'ml-firestarter:tests';

/** Shares of right answers, from 0 to 1. */
interface Score {
  best: number;
  last: number;
  attempts: number;
}

/** Elements that count something, like `[data-progress]` for lessons done; each has its own `[data-progress-label]`. */
const COUNTERS = '[data-progress], [data-test-progress], [data-exercise-progress]';

export function isPass(share: number): boolean {
  return share >= site.passScore;
}

export function percent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

function readScores(): Record<string, Score> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(SCORES_KEY) ?? '{}');
    if (!stored || typeof stored !== 'object') return {};
    return Object.fromEntries(Object.entries(stored).filter(([, score]) => isScore(score)));
  } catch {
    return {};
  }
}

function isScore(value: unknown): value is Score {
  const score = value as Partial<Score> | null;
  return typeof score?.best === 'number' && typeof score.last === 'number' && typeof score.attempts === 'number';
}

/** Saves a finished attempt at the test of the lesson at `path`. */
export function recordScore(path: string, share: number) {
  const scores = readScores();
  const previous = scores[path];
  scores[path] = { best: Math.max(previous?.best ?? 0, share), last: share, attempts: (previous?.attempts ?? 0) + 1 };
  try {
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch {
    // Storage is unavailable (e.g. private mode): the score shows until the page is left.
  }
  paintScores(scores);
}

/** Fills a counter's bar and its `3/5` label. */
export function paintCounter(el: HTMLElement, count: number, total: number) {
  el.style.setProperty('--progress', total ? String(count / total) : '0');
  el.classList.toggle('is-complete', total > 0 && count === total);
  for (const label of el.querySelectorAll<HTMLElement>('[data-progress-label]')) {
    if (label.closest(COUNTERS) === el) label.textContent = `${count}/${total}`;
  }
}

/** Shows the best scores wherever a test is linked or counted. */
export function paintScores(scores = readScores()) {
  const passed = (path: string) => path in scores && isPass(scores[path].best);

  for (const el of document.querySelectorAll<HTMLElement>('[data-test]')) {
    const score = scores[el.dataset.test!];
    el.classList.toggle('is-attempted', score !== undefined);
    el.classList.toggle('is-passed', passed(el.dataset.test!));
    for (const label of el.querySelectorAll<HTMLElement>('[data-test-score]')) {
      label.textContent = score ? percent(score.best) : '';
    }
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-test-progress]')) {
    const paths: string[] = JSON.parse(el.dataset.testProgress!);
    paintCounter(el, paths.filter(passed).length, paths.length);
  }

  const nextTest = document.querySelector<HTMLAnchorElement>('[data-next-test]');
  if (nextTest) {
    const tests: { path: string; url: string; title: string }[] = JSON.parse(nextTest.dataset.nextTest!);
    const labels: Record<'start' | 'continue' | 'review', string> = JSON.parse(nextTest.dataset.nextLabels!);
    const next = tests.find((test) => !passed(test.path));
    const started = tests.some((test) => test.path in scores);
    const target = next ?? tests[0];
    nextTest.href = target.url;
    nextTest.querySelector('[data-next-label]')!.textContent = !next ? labels.review : started ? labels.continue : labels.start;
    nextTest.querySelector('[data-next-title]')!.textContent = target.title;
  }
}
