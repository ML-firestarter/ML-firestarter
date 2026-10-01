/**
 * The practical tasks on the exam page (ExamView.astro, ExamTask.astro; scripts/exam.ts). Each
 * has an editor, whose code is kept in this browser as the reader types, so that it carries over
 * to their next attempt, and a button that runs the code with what's typed in the task's Input
 * box, as on an exercise's page (scripts/exercise.ts). Unlike an exercise, a task has no checks
 * for the reader to run: handing the attempt in has Python run the attempt's test cases on each
 * task's code (python.ts's `observe`), and the page sends the API what they did, never knowing
 * whether it's right.
 */
import type { StartedTask } from '../lib/exams.ts';
import { EXAM_CODE_KEY, readReader } from './account.ts';
import { createEditor, setCode, type EditorView } from './editor.ts';
import { observe, run, stop, warmUp } from './python.ts';
import { APPLE, describeRun, say, setRunning, write, type Strings } from './running.ts';

/** A task, as its section passes it on. */
interface Data {
  id: string;
  starter: string;
  /** What the input box holds at first; left out when the task has none. */
  input?: string;
  /** The task's own files, as JSON, the way python.ts takes them: what its Run button gives the code. */
  files: string;
}

/** What the reader wrote for a task: their code, and what they typed in the input box. */
interface Draft {
  code: string;
  input?: string;
}

/** The signed-in reader's drafts of a chapter's tasks, by task id. */
interface Drafts {
  login: string;
  tasks: Record<string, Draft>;
}

/** What running the attempt's test cases on the tasks' code found out. */
export type Observed =
  | {
      /** What each case of each task did, by task id: empty for a task whose code couldn't run them all. */
      observations: Record<string, string[]>;
      /** Ids of the tasks whose code stopped with an error, or ran too long, before all its cases had run. */
      broken: string[];
      /** The code of those tasks, so that handing in again with the same code can go ahead. */
      signature: string;
    }
  | { failure: 'unavailable' | 'stopped' }
  | { failure: 'crashed'; message: string };

export interface Tasks {
  /** Whether the page has exactly these tasks of an attempt. */
  matches(started: StartedTask[]): boolean;
  /** Puts up each editor with the reader's code; call once the tasks are on show. */
  show(): void;
  /** Where the page has a task, counted from 1; 0 when it hasn't. */
  number(id: string): number;
  /** Runs the cases of the attempt's tasks on the reader's code, one task after the other; `onTask` gets the task's place on the page. */
  observe(started: StartedTask[], handlers: { onLoading(): void; onTask(number: number, total: number): void }): Promise<Observed>;
  /** While handing in, keeps the reader from running their code, which would stop the cases. */
  lock(locked: boolean): void;
  /** Stops the code that's running, if it's a task's. */
  stop(): void;
  /** Forgets the reader's code, once they've passed. */
  forget(): void;
}

/** How long after the last change the code is saved, in milliseconds. */
const SAVE_AFTER = 400;

/** Sets up the tasks in `form`; `chapter` is the language-neutral URL of the chapter, which the reader's code is kept by. */
export function setUpTasks(form: HTMLElement, chapter: string, t: Strings): Tasks {
  const widgets = new Map<string, Widget>();
  for (const section of form.querySelectorAll<HTMLElement>('[data-task]')) {
    const data: Data = JSON.parse(section.querySelector('[data-task-data]')!.textContent!);
    widgets.set(data.id, setUpTask(section, data, chapter, t));
  }
  window.addEventListener('pagehide', () => {
    for (const widget of widgets.values()) widget.save();
  });

  return {
    matches: (started) => started.length === widgets.size && started.every(({ id }) => widgets.has(id)),
    show() {
      for (const widget of widgets.values()) widget.open();
      // The reader will want to run their code soon, and Python takes a few seconds to load.
      if (widgets.size > 0) warmUp();
    },
    number: (id) => [...widgets.keys()].indexOf(id) + 1,
    async observe(started, { onLoading, onTask }) {
      stop();
      const codes = new Map(started.map(({ id }) => [id, widgets.get(id)!.code()]));
      const observations: Record<string, string[]> = {};
      const broken: string[] = [];
      for (const task of started) {
        const announce = () => onTask([...widgets.keys()].indexOf(task.id) + 1, widgets.size);
        announce();
        // The first case starts once Python has loaded, if it had to.
        const outcome = await observe(codes.get(task.id)!, JSON.stringify(task.cases), JSON.stringify(task.files), {
          onLoading,
          onProgress: (number) => number === 1 && announce(),
        });
        if (outcome.status === 'unavailable' || outcome.status === 'stopped') return { failure: outcome.status };
        if (outcome.status === 'crashed') return { failure: 'crashed', message: outcome.message };
        // A case that ran for too long ends the task's cases there: the task can't be solved.
        const result = outcome.status === 'finished' ? outcome.result : undefined;
        const ran = result && !result.error && !result.tooMuch && result.observations.length === task.cases.length;
        observations[task.id] = ran ? result.observations : [];
        if (!ran) broken.push(task.id);
      }
      return { observations, broken, signature: JSON.stringify(broken.map((id) => [id, codes.get(id)])) };
    },
    lock(locked) {
      for (const widget of widgets.values()) widget.lock(locked);
    },
    stop() {
      for (const widget of widgets.values()) widget.stopRunning();
    },
    forget() {
      // The editors keep what's in them but no longer save it, or the code would be back in storage when the page is left.
      for (const widget of widgets.values()) widget.discard();
      const all = readAll();
      delete all[chapter];
      writeAll(all);
    },
  };
}

interface Widget {
  /** Puts the editor up, with the reader's code, the first time. */
  open(): void;
  /** The code in the editor. */
  code(): string;
  /** Keeps the code now rather than after the reader stops typing. */
  save(): void;
  /** Takes the editor down, so that nothing it held is saved again. */
  discard(): void;
  lock(locked: boolean): void;
  /** Stops this task's run, if it's the one running. */
  stopRunning(): void;
}

function setUpTask(section: HTMLElement, data: Data, chapter: string, t: Strings): Widget {
  const holder = section.querySelector<HTMLElement>('[data-editor]')!;
  const input = section.querySelector<HTMLTextAreaElement>('[data-input]');
  const runButton = section.querySelector<HTMLButtonElement>('[data-run]')!;
  const resetButton = section.querySelector<HTMLButtonElement>('[data-reset]')!;
  const status = section.querySelector<HTMLElement>('[data-status]')!;
  const outputBox = section.querySelector<HTMLElement>('[data-output-box]')!;
  const output = section.querySelector<HTMLElement>('[data-output]')!;
  const title = section.querySelector('.task-header h2')!.textContent!;

  let editor: EditorView | undefined;
  /** Whether this task's code is running, and whether handing in has the page's code locked. */
  let busy = false;
  let locked = false;
  /** Counts the runs started, so one that was replaced leaves the page alone when it ends. */
  let started = 0;
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  function open() {
    if (editor) return;
    const draft = readDrafts(chapter)?.[data.id];
    if (input) input.value = draft?.input ?? data.input ?? '';
    holder.replaceChildren();
    editor = createEditor({
      parent: holder,
      code: draft?.code ?? data.starter,
      label: `${t.editor}: ${title}`,
      onChange: scheduleSave,
      onRun: () => {
        if (!locked) startRun();
      },
    });
    // Python takes a few seconds to load, so it starts once the reader looks about to run their code.
    editor.contentDOM.addEventListener('focus', warmUp, { once: true });
  }

  function code(): string {
    open();
    return editor!.state.doc.toString();
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, SAVE_AFTER);
  }

  /** Keeps the reader's code, or forgets it once it's back to the code they started from. */
  function save() {
    clearTimeout(saveTimer);
    if (!editor) return;
    const typed = input?.value;
    const unchanged = code() === data.starter && (typed === undefined || typed === (data.input ?? ''));
    writeDraft(chapter, data.id, unchanged ? undefined : { code: code(), input: typed });
  }

  function setBusy(next: boolean) {
    busy = next;
    setRunning(runButton, busy, busy ? t.stop : t.run);
  }

  function lock(next: boolean) {
    locked = next;
    runButton.disabled = locked;
    resetButton.disabled = locked;
  }

  async function startRun() {
    const mine = ++started;
    setBusy(true);
    say(status, '');
    output.replaceChildren();
    outputBox.hidden = true;
    const outcome = await run(code(), input?.value ?? '', data.files, {
      onLoading: () => mine === started && say(status, t.loading),
      onOutput: (kind, text) => {
        if (mine !== started) return;
        say(status, '');
        outputBox.hidden = false;
        write(output, kind, text);
      },
    });
    if (mine !== started) return;
    setBusy(false);
    say(status, describeRun(outcome, Boolean(output.textContent), t));
  }

  runButton.addEventListener('click', () => (busy ? stop() : startRun()));
  resetButton.addEventListener('click', () => {
    open();
    setCode(editor!, data.starter);
    if (input) input.value = data.input ?? '';
    scheduleSave();
    editor!.focus();
  });
  input?.addEventListener('input', scheduleSave);
  runButton.addEventListener('pointerenter', warmUp, { once: true });

  if (APPLE) {
    section.querySelector('[data-shortcut]')!.textContent = '⌘ Enter';
    resetButton.title = resetButton.title.replace('Ctrl+Z', '⌘Z');
  }

  return {
    open,
    code,
    save,
    discard() {
      clearTimeout(saveTimer);
      editor?.destroy();
      editor = undefined;
    },
    lock,
    stopRunning() {
      // Ends the run, if python.ts still has it, and its promise has the button show Run again.
      if (busy) stop();
    },
  };
}

// ---------- The reader's code, by chapter; storage can be unavailable, as in private windows ----------

function readAll(): Record<string, Drafts> {
  try {
    const all: unknown = JSON.parse(localStorage.getItem(EXAM_CODE_KEY) ?? '{}');
    return all && typeof all === 'object' && !Array.isArray(all) ? (all as Record<string, Drafts>) : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, Drafts>) {
  try {
    if (Object.keys(all).length > 0) localStorage.setItem(EXAM_CODE_KEY, JSON.stringify(all));
    else localStorage.removeItem(EXAM_CODE_KEY);
  } catch {
    // Not kept: the code lasts as long as the page.
  }
}

/** The signed-in reader's drafts of a chapter's tasks, by task id. */
function readDrafts(chapter: string): Record<string, Draft> | undefined {
  const saved: Partial<Drafts> | undefined = readAll()[chapter];
  if (!saved || saved.login !== readReader()?.login || typeof saved.tasks !== 'object' || !saved.tasks) return undefined;
  return Object.fromEntries(
    Object.entries(saved.tasks).flatMap(([id, draft]) =>
      typeof draft?.code === 'string' ? [[id, { code: draft.code, input: typeof draft.input === 'string' ? draft.input : undefined }]] : [],
    ),
  );
}

/** Keeps the reader's draft of a task, or forgets it when there's none. */
function writeDraft(chapter: string, id: string, draft: Draft | undefined) {
  const login = readReader()?.login;
  if (!login) return;
  const all = readAll();
  const tasks = { ...readDrafts(chapter) };
  if (draft) tasks[id] = draft;
  else delete tasks[id];
  if (Object.keys(tasks).length > 0) all[chapter] = { login, tasks };
  else delete all[chapter];
  writeAll(all);
}
