/**
 * The exercise page (ExerciseView.astro): the editor, whose code is kept in this browser as the
 * reader types, and the buttons that run the code and check it with Python in the browser
 * (python.ts). When every check passes, the exercise counts as passed (exercises.ts) and the
 * page shows its solution.
 */
import { plural } from '../lib/i18n.ts';
import { createEditor, setCode } from './editor.ts';
import { EXERCISES_KEY, markPassed, readPassed } from './exercises.ts';
import { CHECK_SECONDS, check, run, stop, warmUp, type CheckReport, type CheckResult } from './python.ts';
import { APPLE, describeRun, element, say, setRunning, write, type Strings } from './running.ts';

/** The exercise, as the page passes it on. */
interface Data {
  /** Language-neutral URL of the exercise, which its pass and the reader's code are kept by. */
  path: string;
  starter: string;
  /** The source of checks.py. */
  checks: string;
  /** The exercise's files, as JSON, the way python.ts takes them. */
  files: string;
  /** What the input box holds at first; left out when the page has none. */
  input?: string;
}

/** What the reader wrote: their code, and what they typed in the input box. */
interface Draft {
  code: string;
  input?: string;
}

/** Where the reader's code is kept, followed by the exercise's path. */
const DRAFT_KEY = 'ml-firestarter:draft:';
/** How long after the last change the code is saved, in milliseconds. */
const SAVE_AFTER = 400;

const page = document.querySelector<HTMLElement>('[data-exercise-page]');
if (page) setUpExercise(page);

function setUpExercise(page: HTMLElement) {
  const data: Data = JSON.parse(page.querySelector('[data-exercise-data]')!.textContent!);
  const t: Strings & { check: string } = JSON.parse(page.querySelector('[data-exercise-strings]')!.textContent!);
  const holder = page.querySelector<HTMLElement>('[data-editor]')!;
  const input = page.querySelector<HTMLTextAreaElement>('[data-input]');
  // A button, as a runnable example in the task has a data-run too (markdown.ts).
  const runButton = page.querySelector<HTMLButtonElement>('button[data-run]')!;
  const checkButton = page.querySelector<HTMLButtonElement>('[data-check]')!;
  const status = page.querySelector<HTMLElement>('[data-status]')!;
  const outputBox = page.querySelector<HTMLElement>('[data-output-box]')!;
  const output = page.querySelector<HTMLElement>('[data-output]')!;
  const results = page.querySelector<HTMLElement>('[data-results]')!;
  const summary = results.querySelector<HTMLElement>('[data-summary]')!;
  const list = results.querySelector<HTMLElement>('[data-check-list]')!;
  const solution = page.querySelector<HTMLElement>('[data-solution]')!;
  const [passIcon, failIcon] = page.querySelector<HTMLTemplateElement>('[data-check-icons]')!.content.querySelectorAll('svg');
  const key = DRAFT_KEY + data.path;

  /** What's running: the code, or its checks. */
  let busy: 'run' | 'check' | undefined;
  /** Counts the runs and checks started, so one that was replaced leaves the page alone when it ends. */
  let started = 0;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  const draft = readDraft(key);
  if (input) input.value = draft?.input ?? data.input ?? '';
  holder.replaceChildren();
  const editor = createEditor({
    parent: holder,
    code: draft?.code ?? data.starter,
    label: t.editor,
    onChange: save,
    onRun: () => {
      if (busy !== 'check') startRun();
    },
  });

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, SAVE_AFTER);
  }

  /** Keeps the reader's code, or forgets it once it's back to the code they started from. */
  function saveNow() {
    clearTimeout(saveTimer);
    const code = editor.state.doc.toString();
    const typed = input?.value;
    try {
      if (code === data.starter && (typed === undefined || typed === (data.input ?? ''))) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify({ code, input: typed } satisfies Draft));
    } catch {
      // Storage is unavailable (e.g. private mode): the code lasts until the page is left.
    }
  }

  /** While one of the buttons' code runs, that button stops it and the other waits. */
  function setBusy(next: typeof busy) {
    busy = next;
    setRunning(runButton, busy === 'run', busy === 'run' ? t.stop : t.run);
    setRunning(checkButton, busy === 'check', busy === 'check' ? t.stop : t.check);
    runButton.disabled = busy === 'check';
    checkButton.disabled = busy === 'run';
  }

  async function startRun() {
    const mine = ++started;
    setBusy('run');
    say(status, '');
    output.replaceChildren();
    outputBox.hidden = true;
    const outcome = await run(editor.state.doc.toString(), input?.value ?? '', data.files, {
      onLoading: () => mine === started && say(status, t.loading),
      onOutput: (kind, text) => {
        if (mine !== started) return;
        say(status, '');
        outputBox.hidden = false;
        write(output, kind, text);
      },
    });
    if (mine !== started) return;
    setBusy(undefined);
    say(status, describeRun(outcome, Boolean(output.textContent), t));
  }

  async function startCheck() {
    const mine = ++started;
    setBusy('check');
    say(status, t.checking);
    results.hidden = true;
    const outcome = await check(editor.state.doc.toString(), data.checks, data.files, {
      onLoading: () => mine === started && say(status, t.loading),
      onProgress: () => mine === started && say(status, t.checking),
    });
    if (mine !== started) return;
    setBusy(undefined);
    say(status, '');
    if (outcome.status === 'finished') {
      report(outcome.result);
    } else if (outcome.status === 'timed-out') {
      list.replaceChildren();
      summarize(false, fill(t.timedOut, { number: String(outcome.number), seconds: String(CHECK_SECONDS) }));
      show(results);
    } else {
      say(status, describeRun(outcome, false, t));
    }
  }

  function report(result: CheckReport) {
    list.replaceChildren(...result.results.map(item));
    const right = result.results.filter((check) => check.ok).length;
    const passed = !result.broken && !result.error && !result.tooMuch && result.results.length > 0 && right === result.results.length;
    if (result.broken) summarize(false, t.broken, block(result.broken));
    else if (result.error) summarize(false, t.codeError, block(result.error));
    else if (result.tooMuch) summarize(false, t.codeTooMuch);
    else if (passed) summarize(true, t.allPassed, paragraph(t.compare));
    else summarize(false, plural(t.lang, result.results.length, t.summary).replace('{passed}', String(right)));
    if (passed) {
      markPassed(data.path);
      solution.hidden = false;
    }
    show(results);
  }

  function summarize(passed: boolean, message: string | Node, ...more: Node[]) {
    results.classList.toggle('is-passed', passed);
    summary.replaceChildren(paragraph(message), ...more);
  }

  /** One check's result: what it tried, and what happened. */
  function item(result: CheckResult): HTMLLIElement {
    const li = element('li', result.ok ? 'check is-ok' : 'check');
    const body = element('div', 'check-body');
    body.append(subject(result), ...explain(result));
    li.append((result.ok ? passIcon : failIcon).cloneNode(true), body);
    return li;
  }

  function subject(result: CheckResult): HTMLElement {
    const inputs = result.inputs?.map(line);
    if (!result.program || !inputs) return paragraph(code(result.expression), 'check-subject');
    if (inputs.length === 0) return paragraph(t.program, 'check-subject');
    const joined = document.createDocumentFragment();
    inputs.forEach((part, i) => joined.append(...(i ? [', ', part] : [part])));
    return paragraph(fill(t.programWith, { input: joined }), 'check-subject');
  }

  function explain(result: CheckResult): Node[] {
    const expected = code(result.expected);
    const got = code(result.got ?? '');
    if (result.ok) {
      const message = { value: t.returns, raises: t.raisesRight, prints: t.printsRight }[result.kind];
      return [paragraph(fill(message, { expected }))];
    }
    if (result.tooMuch) return [paragraph(t.printsTooMuch)];
    if (result.kind === 'value') {
      if (result.raised) return [paragraph(fill(t.raisesInstead, { expected })), block(result.trace ?? result.raised)];
      const nodes: Node[] = [paragraph(fill(t.returnsInstead, { got, expected }))];
      // A function that prints its answer instead of returning it returns None.
      if (result.got === 'None' && result.printed.trim()) nodes.push(paragraph(t.printedInstead), block(result.printed));
      return nodes;
    }
    if (result.kind === 'raises') {
      if (result.raised) return [paragraph(fill(t.raisesOther, { expected })), block(result.trace ?? result.raised)];
      return [paragraph(fill(t.returnsNotRaises, { got, expected }))];
    }
    if (result.raised) return [paragraph(t.stopsWithError), block(result.trace ?? result.raised)];
    const nodes: Node[] = [];
    if (result.line) {
      const { number, expected: wanted, got: printed } = result.line;
      const message = wanted === null ? t.printsTooMany : printed === null ? t.printsTooFew : t.printsInstead;
      nodes.push(paragraph(fill(message, { line: String(number), expected: line(wanted ?? ''), got: line(printed ?? '') })));
    }
    nodes.push(outputs(result.expected, result.got ?? ''));
    return nodes;
  }

  /** What a check of what the code prints expected, next to what it printed. */
  function outputs(expected: string, printed: string): HTMLElement {
    const box = element('div', 'check-outputs');
    for (const [title, text] of [
      [t.expectedOutput, expected],
      [t.yourOutput, printed],
    ]) {
      const column = element('div');
      column.append(paragraph(title, 'check-output-title'), block(text));
      box.append(column);
    }
    return box;
  }

  /** A line of printed text or input, as code; an empty one is described. */
  function line(text: string): Node {
    return text ? code(text) : element('em', undefined, t.emptyLine);
  }

  function show(section: HTMLElement) {
    section.hidden = false;
    section.focus({ preventScroll: true });
    section.scrollIntoView({ block: 'nearest' });
  }

  runButton.addEventListener('click', () => (busy === 'run' ? stop() : startRun()));
  checkButton.addEventListener('click', () => (busy === 'check' ? stop() : startCheck()));
  const resetButton = page.querySelector<HTMLButtonElement>('[data-reset]')!;
  resetButton.addEventListener('click', () => {
    setCode(editor, data.starter);
    editor.focus();
  });
  input?.addEventListener('input', save);
  window.addEventListener('pagehide', saveNow);

  // Python takes a few seconds to load, so it starts once the reader looks about to run their code.
  editor.contentDOM.addEventListener('focus', warmUp, { once: true });
  for (const button of [runButton, checkButton]) button.addEventListener('pointerenter', warmUp, { once: true });

  if (APPLE) {
    page.querySelector('[data-shortcut]')!.textContent = '⌘ Enter';
    resetButton.title = resetButton.title.replace('Ctrl+Z', '⌘Z');
  }

  const paintSolution = () => {
    if (readPassed().has(data.path)) solution.hidden = false;
  };
  paintSolution();
  // Passed in another tab.
  window.addEventListener('storage', (event) => {
    if (event.key === EXERCISES_KEY) paintSolution();
  });
}

function readDraft(key: string): Draft | undefined {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? 'null') as Partial<Draft> | null;
    if (typeof stored?.code === 'string') return { code: stored.code, input: typeof stored.input === 'string' ? stored.input : undefined };
  } catch {
    // Nothing kept, or storage is unavailable.
  }
  return undefined;
}

/** A translated phrase with elements or text in place of its `{name}`s. */
function fill(template: string, parts: Record<string, string | Node>): DocumentFragment {
  const fragment = document.createDocumentFragment();
  for (const piece of template.split(/(\{\w+\})/)) {
    const part = /^\{\w+\}$/.test(piece) ? parts[piece.slice(1, -1)] : undefined;
    fragment.append(part ?? piece);
  }
  return fragment;
}

function paragraph(content: string | Node, className?: string): HTMLParagraphElement {
  const p = element('p', className);
  p.append(content);
  return p;
}

function code(text: string): HTMLElement {
  return element('code', undefined, text);
}

/** Text as Python printed it, like a traceback. */
function block(text: string): HTMLPreElement {
  return element('pre', undefined, text);
}
