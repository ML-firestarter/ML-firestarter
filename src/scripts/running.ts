/**
 * What the exercise page (exercise.ts) and the lessons' runnable examples (runnable.ts) share:
 * showing what the reader's code printed, how it ended, and the page's buttons and messages.
 */
import type { Lang, ui } from '../lib/i18n.ts';
import type { CheckReport, Kind, Outcome, RunResult } from './python.ts';

/** The pages' text for running code, passed to the scripts as JSON. */
export type Strings = (typeof ui)['en']['exercises']['script'] & {
  lang: Lang;
  run: string;
  stop: string;
  /** Names the editor for screen readers. */
  editor: string;
};

/** What to tell the reader about how their code ended, if anything: what it printed, errors included, is shown already. */
export function describeRun(outcome: Outcome<RunResult | CheckReport>, printed: boolean, t: Strings): string {
  switch (outcome.status) {
    case 'finished': {
      const result = outcome.result as RunResult;
      if (result.status === 'too-much-output') return t.tooMuch;
      if (result.ranOut) return t.ranOut;
      return result.status === 'done' && !printed ? t.nothing : '';
    }
    case 'stopped':
      return t.stopped;
    case 'unavailable':
      return t.unavailable;
    case 'crashed':
      return t.crashed.replace('{message}', outcome.message);
    default:
      return '';
  }
}

/** Adds what the code printed to an output box, keeping the box scrolled to the end if it was. */
export function write(output: HTMLElement, kind: Kind, text: string) {
  const atEnd = output.scrollTop + output.clientHeight >= output.scrollHeight - 4;
  // What input() read shows as typed in, and errors in their own colour.
  output.append(kind === 'out' ? text : element('span', kind === 'in' ? 'typed' : 'error', text));
  if (atEnd) output.scrollTop = output.scrollHeight;
}

/** Whether keyboard shortcuts use ⌘ rather than Ctrl, as on a Mac. */
export const APPLE = /Mac|iPhone|iPad/.test(navigator.platform);

export function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

/** Shows a message in `el`, or hides it when there's none. */
export function say(el: HTMLElement, message: string) {
  el.textContent = message;
  el.hidden = !message;
}

/** Shows a button as the one that starts the code, or as the one that stops it. */
export function setRunning(button: HTMLButtonElement, running: boolean, text: string) {
  button.toggleAttribute('data-busy', running);
  button.querySelector('[data-label]')!.textContent = text;
}
