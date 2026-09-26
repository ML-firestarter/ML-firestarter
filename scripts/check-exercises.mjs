/**
 * Checks every exercise in exercises/ the way its page does: runs its checks.py on its
 * solution.py, which has to pass every check, and on its starter.py, which mustn't, as the reader
 * would have nothing to do. Python is Pyodide from node_modules, running src/scripts/harness.py
 * in a worker thread, so a check that never ends can be stopped. Exercises marked `draft: true`
 * are left out.
 *
 *   npm run check:exercises
 *
 * Pull requests run it too (.github/workflows/check-exercises.yml).
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const EXERCISES_DIR = path.join(ROOT, 'exercises');
/** How long each check can take, as on the site (src/scripts/python.ts). */
const CHECK_SECONDS = 10;
/** A task file: task.md, or a translation like task.pl.md. */
const TASK = /^task(?:\.[a-z]{2})?\.md$/i;

if (isMainThread) {
  process.exitCode = await main();
} else {
  await serve();
}

async function main() {
  const exercises = findExercises(EXERCISES_DIR);
  if (exercises.length === 0) {
    console.log('No exercises to check.');
    return 0;
  }

  const { version } = JSON.parse(readFileSync(path.join(pyodideDir(), 'package.json'), 'utf8'));
  console.log(`Checking ${exercises.length} exercise${exercises.length === 1 ? '' : 's'} with Pyodide ${version}…\n`);
  let python = startPython();
  let failed = 0;
  for (const dir of exercises) {
    const name = path.relative(EXERCISES_DIR, dir).split(path.sep).join('/');
    const problems = [];
    const missing = ['starter.py', 'solution.py', 'checks.py'].filter((file) => !existsSync(path.join(dir, file)));
    if (missing.length) {
      problems.push({ file: missing[0], message: `There's no ${missing.join(' or ')}.` });
    } else {
      const read = (file) => readFileSync(path.join(dir, file), 'utf8');
      const request = { checks: read('checks.py'), files: JSON.stringify(readFiles(dir)) };
      for (const file of ['solution.py', 'starter.py']) {
        const outcome = await python.check({ ...request, code: read(file) });
        // Ending the worker is the only way to stop Python; the next check gets a new one.
        if (outcome.status !== 'finished') python = restart(python);
        const found = file === 'solution.py' ? solutionProblems(outcome) : starterProblems(outcome);
        problems.push(...found.map((problem) => ({ file, ...problem })));
        // A mistake in checks.py shows the same way for both.
        if (found.some((problem) => problem.file === 'checks.py')) break;
      }
    }

    if (problems.length === 0) {
      console.log(`✓ ${name}`);
      continue;
    }
    failed++;
    console.log(`✗ ${name}`);
    for (const { file, message } of problems) {
      console.log(indent(`${file}: ${message}`));
      annotate(path.join(dir, file), message);
    }
  }
  await python.worker.terminate();

  console.log(failed ? `\n${failed} of ${exercises.length} exercises have problems.` : `\nAll ${exercises.length} exercises pass.`);
  return failed ? 1 : 0;
}

/** Folders with a task file, not marked as drafts, sorted. */
function findExercises(dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  const tasks = entries.filter((entry) => entry.isFile() && TASK.test(entry.name));
  if (tasks.length && !tasks.every((task) => isDraft(path.join(dir, task.name)))) found.push(dir);
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'files') found.push(...findExercises(path.join(dir, entry.name)));
  }
  return found.sort();
}

function isDraft(file) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))?.[1] ?? '';
  return /^draft:[ \t]*true[ \t]*$/m.test(frontmatter);
}

/** The exercise's files/ folder, the way its page passes it on (readFiles in src/lib/course.ts). */
function readFiles(dir) {
  const root = path.join(dir, 'files');
  if (!existsSync(root)) return {};
  const files = {};
  for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(entry.parentPath, entry.name);
    files[path.relative(root, file).split(path.sep).join('/')] = readFileSync(file).toString('base64');
  }
  return files;
}

/** What's wrong when the solution doesn't pass every check. */
function solutionProblems(outcome) {
  if (outcome.status === 'timed-out') return [{ message: `Check ${outcome.number} takes longer than ${CHECK_SECONDS} seconds.` }];
  if (outcome.status === 'crashed') return [{ message: `Python failed while checking it: ${outcome.message}` }];
  const { results, error, tooMuch, broken } = outcome.result;
  if (broken) return [{ file: 'checks.py', message: broken }];
  if (error) return [{ message: `It stops with an error before the checks can run:\n${error.trimEnd()}` }];
  if (tooMuch) return [{ message: 'It prints so much before the checks can run that it was stopped.' }];
  return results.flatMap((result, i) => (result.ok ? [] : [{ message: `Check ${i + 1}, ${result.expression}: ${explain(result)}` }]));
}

/** What's wrong when the starting code passes every check already. */
function starterProblems(outcome) {
  if (outcome.status !== 'finished') return [];
  const { results, error, tooMuch, broken } = outcome.result;
  if (broken) return [{ file: 'checks.py', message: broken }];
  if (error || tooMuch || results.some((result) => !result.ok)) return [];
  return [{ message: 'It passes every check already, so the reader would have nothing to do.' }];
}

function explain(result) {
  if (result.tooMuch) return 'it prints so much that it was stopped.';
  if (result.kind === 'raises') {
    return result.raised ? `it raises ${result.raised} instead of ${result.expected}.` : `it gives ${result.got} instead of raising ${result.expected}.`;
  }
  if (result.raised) return `it raises an error:\n${(result.trace ?? result.raised).trimEnd()}`;
  if (result.kind === 'value') return `it gives ${result.got} instead of ${result.expected}.`;
  const { number, expected, got } = result.line;
  if (expected === null) return `line ${number} of what it prints is ${JSON.stringify(got)}, where the output should end.`;
  if (got === null) return `what it prints ends before line ${number}, which should be ${JSON.stringify(expected)}.`;
  return `line ${number} of what it prints is ${JSON.stringify(got)} instead of ${JSON.stringify(expected)}.`;
}

function indent(text) {
  return text.replace(/^/gm, '    ');
}

/** Marks the file on the pull request, when GitHub Actions runs this. */
function annotate(file, message) {
  if (process.env.GITHUB_ACTIONS !== 'true') return;
  const escape = (text) => text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  console.log(`::error file=${escape(path.relative(ROOT, file).split(path.sep).join('/'))}::${escape(message)}`);
}

/** A worker thread with Python loaded, and a way to run checks in it. */
function startPython() {
  const worker = new Worker(new URL(import.meta.url));
  const ready = new Promise((resolve, reject) => {
    worker.once('message', resolve);
    worker.once('error', reject);
  });
  let lastId = 0;

  /** Runs checks in the worker: the outcome is like python.ts's, `finished`, `timed-out` or `crashed`. */
  async function check(request) {
    await ready;
    const id = ++lastId;
    return new Promise((resolve) => {
      let timer;
      const finish = (outcome) => {
        clearTimeout(timer);
        worker.off('message', receive);
        worker.off('error', fail);
        resolve(outcome);
      };
      const receive = (reply) => {
        if (reply.id !== id) return;
        if (reply.type === 'progress') {
          // Each check has CHECK_SECONDS, from when it starts.
          clearTimeout(timer);
          timer = setTimeout(() => finish({ status: 'timed-out', number: reply.number }), CHECK_SECONDS * 1000);
        } else if (reply.type === 'done') {
          finish({ status: 'finished', result: reply.result });
        } else {
          finish({ status: 'crashed', message: reply.message });
        }
      };
      const fail = (error) => finish({ status: 'crashed', message: String(error) });
      worker.on('message', receive);
      worker.on('error', fail);
      worker.postMessage({ id, ...request });
    });
  }

  return { worker, check };
}

function restart(python) {
  python.worker.terminate();
  return startPython();
}

function pyodideDir() {
  return fileURLToPath(new URL('./', import.meta.resolve('pyodide')));
}

/** The worker thread: loads Pyodide and the harness, then runs the checks it's sent. */
async function serve() {
  const { loadPyodide } = await import('pyodide');
  const pyodide = await loadPyodide({ indexURL: pyodideDir() });
  const globals = pyodide.globals.get('dict')();
  const harness = readFileSync(path.join(ROOT, 'src/scripts/harness.py'), 'utf8');
  pyodide.runPython(harness, { globals, filename: 'harness.py' });
  const check = globals.get('check');
  const quiet = { messageCallback: () => {}, errorCallback: () => {} };

  parentPort.on('message', async ({ id, code, checks, files }) => {
    try {
      await pyodide.loadPackagesFromImports(code, quiet);
      await pyodide.loadPackagesFromImports(checks, quiet);
      const send = (kind, text) => {
        if (kind === 'check') parentPort.postMessage({ id, type: 'progress', number: Number(text) });
      };
      parentPort.postMessage({ id, type: 'done', result: JSON.parse(check(code, checks, files, send)) });
    } catch (error) {
      parentPort.postMessage({ id, type: 'crash', message: String(error) });
    }
  });
  parentPort.postMessage({ type: 'ready' });
}
