/**
 * Runs readers' Python for the page, in a worker (python.worker.ts) that loads Pyodide the first
 * time it's needed. One piece of code runs at a time, so starting one stops the one before.
 * Code that never ends can only be stopped by ending the worker, so stopping code does that,
 * and the next piece of code starts Python afresh.
 */

export type Kind = 'out' | 'in' | 'err';

/** How a program's run ended (harness.py's `run`). */
export interface RunResult {
  status: 'done' | 'error' | 'too-much-output';
  /** Whether the error was input() finding no line left to read. */
  ranOut: boolean;
}

/** One check's result (harness.py's `Attempt.evaluate`). */
export interface CheckResult {
  expression: string;
  kind: 'value' | 'raises' | 'prints';
  /** Whether the check runs the code as a program: `program('3', '4')`. */
  program: boolean;
  /** The lines a program check types in. */
  inputs: string[] | null;
  /** The value, error or output the check expects, as Python writes it. */
  expected: string;
  ok: boolean;
  /** The value the expression gave, or what it printed for checks of what it prints. */
  got: string | null;
  /** Everything printed while it ran. */
  printed: string;
  /** The error it raised, on one line, and its traceback. */
  raised: string | null;
  trace: string | null;
  /** For checks of what it prints: the first line that's different, counted from 1. */
  line: { number: number; expected: string | null; got: string | null } | null;
  tooMuch: boolean;
}

/** An exercise's checks, run on the reader's code (harness.py's `check`). */
export interface CheckReport {
  /** One for each check that ran. */
  results: CheckResult[];
  /** The traceback of the error that stopped the code before the checks could run. */
  error?: string;
  /** Whether the code printed too much before the checks could run. */
  tooMuch?: boolean;
  /** A mistake in the exercise's checks.py. */
  broken?: string;
}

/** Messages to the worker. `files` is JSON with each of the exercise's files, in base64, by name. */
export type Request =
  | { type: 'run'; id: number; code: string; input: string; files: string }
  | { type: 'check'; id: number; code: string; checks: string; files: string };

/** Messages from the worker. */
export type Reply =
  | { type: 'ready' }
  | { type: 'failed'; message: string }
  | { type: 'output'; id: number; kind: Kind; text: string }
  | { type: 'progress'; id: number; number: number }
  | { type: 'done'; id: number; result: RunResult | CheckReport }
  | { type: 'crash'; id: number; message: string };

/** How a piece of code ended. */
export type Outcome<T> =
  | { status: 'finished'; result: T }
  /** Stopped by stop(), or by other code starting. */
  | { status: 'stopped' }
  /** Check `number` ran for longer than CHECK_SECONDS. */
  | { status: 'timed-out'; number: number }
  /** Python couldn't be loaded, like when the reader is offline. */
  | { status: 'unavailable' }
  /** Python itself failed, like when the code used up its memory. */
  | { status: 'crashed'; message: string };

interface Handlers {
  /** Called when the code has to wait for Python to load. */
  onLoading?(): void;
  onOutput?(kind: Kind, text: string): void;
  /** Called as each check starts, with its number, counted from 1. */
  onProgress?(number: number): void;
}

interface Job extends Handlers {
  request: Request;
  /** Whether the worker has it. */
  sent: boolean;
  finish(outcome: Outcome<RunResult | CheckReport>): void;
}

/** How long each check can take. */
export const CHECK_SECONDS = 10;

let worker: Worker | undefined;
/** Whether Python has loaded, once the worker says. */
let ready: Promise<boolean> | undefined;
let loaded = false;
let job: Job | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let lastId = 0;

/** Runs code as a program, with `input` as what's typed in, and passes on what it prints as it goes. */
export function run(code: string, input: string, files: string, handlers: Handlers = {}): Promise<Outcome<RunResult>> {
  return start({ type: 'run', id: ++lastId, code, input, files }, handlers) as Promise<Outcome<RunResult>>;
}

/** Runs an exercise's checks, the source of its checks.py, on the reader's code. */
export function check(code: string, checks: string, files: string, handlers: Handlers = {}): Promise<Outcome<CheckReport>> {
  return start({ type: 'check', id: ++lastId, code, checks, files }, handlers) as Promise<Outcome<CheckReport>>;
}

/** Stops the code that's running, if any. */
export function stop() {
  if (!job) return;
  const stopped = job;
  // Code that's running can only be stopped with its worker; code still waiting for Python leaves it loading.
  if (stopped.sent) reset();
  finish({ status: 'stopped' });
}

/** Starts loading Python, when the reader looks about to run some. */
export function warmUp() {
  load();
}

function start(request: Request, handlers: Handlers): Promise<Outcome<RunResult | CheckReport>> {
  stop();
  return new Promise((resolve) => {
    const current: Job = { request, sent: false, finish: resolve, ...handlers };
    job = current;
    if (!loaded) current.onLoading?.();
    load().then((ok) => {
      if (job !== current) return;
      if (!ok) return finish({ status: 'unavailable' });
      current.sent = true;
      worker!.postMessage(request);
    });
  });
}

function load(): Promise<boolean> {
  if (ready) return ready;
  const started = new Worker(new URL('./python.worker.ts', import.meta.url), { type: 'module' });
  worker = started;
  ready = new Promise((resolve) => {
    started.addEventListener('message', ({ data }: MessageEvent<Reply>) => {
      // A worker that was ended may still have messages on the way.
      if (worker !== started) return;
      if (data.type === 'ready') {
        loaded = true;
        resolve(true);
      } else if (data.type === 'failed') {
        console.error(`Python couldn't be loaded: ${data.message}`);
        // The next piece of code tries again, as the reader may be back online.
        reset();
        resolve(false);
      } else {
        receive(data);
      }
    });
    started.addEventListener('error', () => {
      if (worker !== started) return;
      reset();
      resolve(false);
    });
  });
  return ready;
}

function receive(reply: Exclude<Reply, { type: 'ready' | 'failed' }>) {
  const current = job;
  if (!current || reply.id !== current.request.id) return;
  if (reply.type === 'output') {
    current.onOutput?.(reply.kind, reply.text);
  } else if (reply.type === 'progress') {
    current.onProgress?.(reply.number);
    clearTimeout(timer);
    timer = setTimeout(() => {
      reset();
      finish({ status: 'timed-out', number: reply.number });
    }, CHECK_SECONDS * 1000);
  } else if (reply.type === 'done') {
    finish({ status: 'finished', result: reply.result });
  } else {
    console.error(`Python failed: ${reply.message}`);
    reset();
    finish({ status: 'crashed', message: reply.message });
  }
}

function finish(outcome: Outcome<RunResult | CheckReport>) {
  const current = job;
  job = undefined;
  clearTimeout(timer);
  current?.finish(outcome);
}

/** Ends the worker; the next piece of code starts a new one. */
function reset() {
  worker?.terminate();
  worker = undefined;
  ready = undefined;
  loaded = false;
}
