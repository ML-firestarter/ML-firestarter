/**
 * The reader's attempts at the chapter exams, which the API keeps (server/exams.ts), and the
 * links to the exams that show them. Pages keep what the API says for a few minutes, in this
 * tab's sessionStorage, rather than ask again on every page.
 */
import type { Attempt, ExamError, ExamRecord, ExamStatus } from '../lib/exams.ts';
import { EXAMS_KEY, paintAccount, readReader } from './account.ts';
import { percent } from './scores.ts';

const CACHE_TIME = 10 * 60 * 1000;

type Exams = Record<string, ExamRecord>;

interface Kept {
  at: number;
  /** Whose attempts they are, in case someone else signs in on this browser. */
  login: string;
  exams: Exams;
}

/** The reader's attempts, by the chapter's language-neutral URL, or why they couldn't be loaded. */
export async function loadExams(fresh = false): Promise<{ exams: Exams } | { error: ExamError['error'] }> {
  const reader = readReader();
  if (!reader) return { error: 'signed-out' };
  const kept = readKept();
  if (!fresh && kept?.login === reader.login && Date.now() - kept.at < CACHE_TIME) return { exams: kept.exams };
  try {
    const response = await fetch('/api/exams', { headers: { Accept: 'application/json' } });
    // The API signed the reader out, as when their GitHub token was revoked.
    if (response.status === 401) paintAccount();
    const data: Partial<ExamStatus & ExamError> = await response.json().catch(() => ({}));
    if (!response.ok || !data.exams) return { error: data.error ?? 'server' };
    writeKept({ at: Date.now(), login: reader.login, exams: data.exams });
    return { exams: data.exams };
  } catch {
    return { error: 'server' };
  }
}

/** Adds an attempt the reader just handed in, so other pages show it without asking the API again. */
export function keepAttempt(chapter: string, attempt: Attempt, next?: string) {
  const kept = readKept();
  if (!kept || kept.login !== readReader()?.login) return;
  const attempts = [...(kept.exams[chapter]?.attempts ?? []), attempt];
  writeKept({ ...kept, exams: { ...kept.exams, [chapter]: { attempts, next } } });
}

/** Shows the best score and whether it passed wherever an exam is linked. */
export function paintExams(exams: Exams) {
  for (const el of document.querySelectorAll<HTMLElement>('[data-exam]')) {
    const attempts = exams[el.dataset.exam!]?.attempts ?? [];
    el.classList.toggle('is-attempted', attempts.length > 0);
    el.classList.toggle('is-passed', attempts.some((attempt) => attempt.passed));
    const best = Math.max(0, ...attempts.map((attempt) => attempt.score));
    for (const label of el.querySelectorAll<HTMLElement>('[data-exam-score]')) {
      label.textContent = attempts.length > 0 ? percent(best) : '';
    }
  }
}

function readKept(): Kept | undefined {
  try {
    const kept: Partial<Kept> | null = JSON.parse(sessionStorage.getItem(EXAMS_KEY) ?? 'null');
    if (typeof kept?.at === 'number' && typeof kept.login === 'string' && typeof kept.exams === 'object' && kept.exams) return kept as Kept;
  } catch {
    // Loaded again.
  }
  return undefined;
}

function writeKept(kept: Kept) {
  try {
    sessionStorage.setItem(EXAMS_KEY, JSON.stringify(kept));
  } catch {
    // Not kept: pages ask the API each time.
  }
}
