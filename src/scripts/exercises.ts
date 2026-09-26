/**
 * The exercises the reader has passed, kept in this browser's localStorage by their
 * language-neutral paths, so they carry over between languages like lesson progress.
 */
import { paintCounter } from './scores.ts';

export const EXERCISES_KEY = 'ml-firestarter:exercises';

export function readPassed(): Set<string> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(EXERCISES_KEY) ?? '[]');
    return new Set(Array.isArray(stored) ? stored.filter((path) => typeof path === 'string') : []);
  } catch {
    return new Set();
  }
}

/** Keeps the exercise at `path` as passed. */
export function markPassed(path: string) {
  const passed = readPassed();
  passed.add(path);
  try {
    localStorage.setItem(EXERCISES_KEY, JSON.stringify([...passed]));
  } catch {
    // Storage is unavailable (e.g. private mode): the pass shows until the page is left.
  }
  paintExercises(passed);
}

/** Shows which exercises are passed wherever one is linked or counted. */
export function paintExercises(passed = readPassed()) {
  for (const el of document.querySelectorAll<HTMLElement>('[data-exercise]')) {
    el.classList.toggle('is-passed', passed.has(el.dataset.exercise!));
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-exercise-progress]')) {
    const paths: string[] = JSON.parse(el.dataset.exerciseProgress!);
    const count = paths.filter((path) => passed.has(path)).length;
    paintCounter(el, count, paths.length);
    el.classList.toggle('is-started', count > 0);
  }
}
