/**
 * Makes and checks the practical tasks of the exams in exams/, the copy of the private
 * repository. A task is a folder in a chapter's `tasks/` folder there:
 *
 *   task.md, task.pl.md   what to do, and its translations
 *   starter.py            the code the reader starts from
 *   solution.py           the reference solution; never leaves the private repository
 *   cases.py              makes the instances attempts draw from: `make(rng, index)` returns
 *                         `{'cases': [...], 'files': {...}}`, the Python expressions to run on the
 *                         reader's code and the files they read. Optional: `INSTANCES`, how many
 *                         to make, and `RAISES`, the kinds of error the right code raises
 *   pool.json             the instances, with what the solution does with them: made by this script
 *   wrong/*.py            solutions that have one plausible mistake each, which no instance can let through
 *   files/                files the code can open when the reader runs it
 *
 *   npm run exam-tasks                 writes each task's pool.json from its cases.py and solution.py
 *   npm run check:exam-tasks           checks the tasks, their pools and their solutions
 *   npm run exam-tasks -- triangles    does it only for the tasks with "triangles" in their path
 *
 * Python is Pyodide from node_modules, running src/scripts/harness.py in a worker thread, as on
 * the site, so a case that never ends can be stopped. Tasks marked `draft: true` are left out.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort } from 'node:worker_threads';
import { libraryProvider, packageBaseUrl } from './libraries.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const EXAMS_DIR = path.join(ROOT, 'exams');
/** How long each case can take, as on the site (src/scripts/python.ts). */
const CASE_SECONDS = 10;
/** A task file: task.md, or a translation like task.pl.md. */
const TASK = /^task(?:\.[a-z]{2})?\.md$/i;
/** How many instances a task's pool has unless its cases.py says; and the fewest it can have. */
const DEFAULT_INSTANCES = 8;
const MIN_INSTANCES = 6;
/** What the site accepts in a pool (readPool in src/lib/course.ts). */
const MAX_CASES = 40;
const MAX_CASE_LENGTH = 400;
const MAX_INSTANCE_FILES = 20_000;

async function main() {
  const args = process.argv.slice(2);
  const checking = args.includes('--check');
  const filters = args.filter((arg) => !arg.startsWith('--'));
  if (!existsSync(EXAMS_DIR)) {
    console.log("There's no exams/ folder, which holds a copy of the private repository, so there are no exam tasks.");
    return 0;
  }
  const tasks = findTasks().filter((task) => filters.every((filter) => task.name.includes(filter)));
  if (tasks.length === 0) {
    console.log(`No exam tasks to ${checking ? 'check' : 'make pools for'}.`);
    return 0;
  }

  const { version } = JSON.parse(readFileSync(path.join(pyodideDir(), 'package.json'), 'utf8'));
  console.log(`${checking ? 'Checking' : 'Making pools for'} ${tasks.length} exam task${tasks.length === 1 ? '' : 's'} with Pyodide ${version}…\n`);
  const python = new Python();
  let failed = 0;
  for (const task of tasks) {
    const problems = checking ? await checkTask(python, task) : await makePool(python, task);
    if (problems.length === 0) {
      console.log(`✓ ${task.name}${task.summary ? ` (${task.summary})` : ''}`);
      continue;
    }
    failed++;
    console.log(`✗ ${task.name}`);
    for (const { file, message } of problems) {
      console.log(indent(`${file}: ${message}`));
      annotate(path.join(task.dir, file), message);
    }
  }
  await python.stop();

  console.log(failed ? `\n${failed} of ${tasks.length} tasks have problems.` : `\nAll ${tasks.length} tasks are fine.`);
  return failed ? 1 : 0;
}

// ---------- Finding tasks ----------

/** Every folder in a chapter's tasks/ folder with a task file, not marked as a draft, sorted. */
function findTasks() {
  const found = [];
  for (const chapter of readdirSync(EXAMS_DIR, { withFileTypes: true })) {
    const tasksDir = path.join(EXAMS_DIR, chapter.name, 'tasks');
    if (!chapter.isDirectory() || !existsSync(tasksDir)) continue;
    for (const entry of readdirSync(tasksDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(tasksDir, entry.name);
      const files = readdirSync(dir).filter((file) => TASK.test(file));
      if (files.length === 0 || files.every((file) => isDraft(path.join(dir, file)))) continue;
      found.push({ dir, name: `${chapter.name}/tasks/${entry.name}`, files });
    }
  }
  return found.sort((a, b) => (a.name < b.name ? -1 : 1));
}

function isDraft(file) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(readFileSync(file, 'utf8'))?.[1] ?? '';
  return /^draft:[ \t]*true[ \t]*$/m.test(frontmatter);
}

const read = (task, file) => readFileSync(path.join(task.dir, file), 'utf8');

/** The files the task needs, or what's wrong when one is missing. */
function missingFiles(task) {
  const missing = ['task.md', 'starter.py', 'solution.py', 'cases.py'].filter((file) => !existsSync(path.join(task.dir, file)));
  return missing.length ? [{ file: missing[0], message: `There's no ${missing.join(' or ')}.` }] : [];
}

/** The mistaken solutions in the task's wrong/ folder, by file name. */
function readWrong(task) {
  const dir = path.join(task.dir, 'wrong');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith('.py'))
    .sort()
    .map((file) => ({ file: `wrong/${file}`, code: read(task, `wrong/${file}`) }));
}

// ---------- Making a pool ----------

/** Writes pool.json: instances from cases.py, with what solution.py does on them. */
async function makePool(python, task) {
  const missing = missingFiles(task);
  if (missing.length) return missing;
  const made = await python.instances(task);
  if (made.problems) return made.problems;
  const problems = [];
  const instances = [];
  for (const [i, instance] of made.instances.entries()) {
    const seen = await python.observe(read(task, 'solution.py'), instance);
    if (seen.problem) {
      problems.push({ file: 'solution.py', message: `Instance ${i + 1}: ${seen.problem}` });
      break;
    }
    const odd = unexpected(instance, seen.observations, made.raises);
    if (odd) {
      problems.push({ file: 'solution.py', message: `Instance ${i + 1}, ${odd}` });
      break;
    }
    instances.push({ ...instance, expected: seen.observations });
  }
  if (problems.length) return problems;

  writeFileSync(path.join(task.dir, 'pool.json'), `${JSON.stringify({ instances }, null, 2)}\n`);
  task.summary = `${instances.length} instances of ${instances[0].cases.length} cases`;
  return [];
}

/** What's strange about what the solution did on an instance: it shouldn't fail or print too much, and raise only the errors cases.py allows. */
function unexpected(instance, observations, raises) {
  for (const [i, text] of observations.entries()) {
    const where = `case ${i + 1}, ${instance.cases[i]}:`;
    if (text === 'too much output' || text === 'unwritable') return `${where} the solution gives ${text}.`;
    const error = /^raised (\w+)$/.exec(text)?.[1];
    if (error && !raises.includes(error)) {
      return `${where} the solution raises ${error}. If it should, put ${error} in RAISES in cases.py, like RAISES = ["ValueError"].`;
    }
  }
}

// ---------- Checking a task ----------

async function checkTask(python, task) {
  const missing = missingFiles(task);
  if (missing.length) return missing;
  if (!existsSync(path.join(task.dir, 'pool.json'))) return [{ file: 'pool.json', message: 'There is none yet. Run "npm run exam-tasks" to make it.' }];
  const problems = [];
  const add = (file, message) => problems.push({ file, message });

  const pool = readPool(task);
  if (pool.problem) return [{ file: 'pool.json', message: pool.problem }];
  const { instances } = pool;
  task.summary = `${instances.length} instances`;

  // The pool is what cases.py and solution.py make now.
  const made = await python.instances(task);
  if (made.problems) return made.problems;
  const solution = read(task, 'solution.py');
  for (const [i, instance] of instances.entries()) {
    const fresh = made.instances[i];
    if (!fresh || JSON.stringify([fresh.cases, fresh.files]) !== JSON.stringify([instance.cases, instance.files])) {
      add('pool.json', `Instance ${i + 1} isn't what cases.py makes. Run "npm run exam-tasks" to make the pool again.`);
      break;
    }
    const seen = await python.observe(solution, instance);
    if (seen.problem) {
      add('solution.py', `Instance ${i + 1}: ${seen.problem}`);
      break;
    }
    const odd = unexpected(instance, seen.observations, made.raises);
    if (odd) {
      add('solution.py', `Instance ${i + 1}, ${odd}`);
      break;
    }
    const different = seen.observations.findIndex((text, j) => text !== instance.expected[j]);
    if (different >= 0) {
      add('pool.json', `Instance ${i + 1} expects other results than solution.py gives, from case ${different + 1} on. Run "npm run exam-tasks" to make the pool again.`);
      break;
    }
  }
  if (made.instances.length !== instances.length && problems.length === 0) {
    add('pool.json', `It has ${instances.length} instances, and cases.py makes ${made.instances.length}. Run "npm run exam-tasks" to make the pool again.`);
  }
  if (problems.length) return problems;

  // No instance is let through by the starting code or by a solution with a mistake in it.
  const lint = await python.lint(solution);
  for (const message of lint) add('solution.py', message);
  const wrong = readWrong(task);
  for (const { file, code } of [{ file: 'starter.py', code: read(task, 'starter.py') }, ...wrong]) {
    const stops = await python.stops(code, instances[0]);
    if (stops) {
      add(file, stops);
      continue;
    }
    for (const [i, instance] of instances.entries()) {
      const seen = await python.observe(code, instance);
      const passes = !seen.problem && seen.observations.length === instance.expected.length && seen.observations.every((text, j) => text === instance.expected[j]);
      if (passes) {
        add(file, file === 'starter.py' ? `The starting code passes instance ${i + 1}, so the reader would have nothing to do.` : `It passes instance ${i + 1}, so a reader with that mistake would pass the task. Add a case that catches it to cases.py.`);
        break;
      }
    }
  }
  if (wrong.length === 0) add('wrong/', 'There are no wrong solutions. Add a few in wrong/, each with one plausible mistake, to show that the cases catch them.');
  return problems;
}

/** The instances in pool.json, or what's wrong with them. */
function readPool(task) {
  let parsed;
  try {
    parsed = JSON.parse(read(task, 'pool.json'));
  } catch {
    return { problem: `It isn't JSON. Run "npm run exam-tasks" to make it again.` };
  }
  const instances = parsed?.instances;
  if (!Array.isArray(instances) || instances.length < MIN_INSTANCES) {
    return { problem: `It has ${Array.isArray(instances) ? instances.length : 'no'} instances, and a task needs at least ${MIN_INSTANCES}. Run "npm run exam-tasks" to make it again.` };
  }
  for (const [i, instance] of instances.entries()) {
    const { cases, files = {}, expected } = instance ?? {};
    const strings = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');
    if (!strings(cases) || !strings(expected) || cases.length !== expected.length) {
      return { problem: `Instance ${i + 1} doesn't have a list of cases and a list of what they give, of the same length.` };
    }
    instance.files = files;
  }
  return { instances };
}

/** What's wrong with an instance that cases.py made, if something is: it has to be what the site accepts in a pool. */
function checkInstance(instance, number) {
  const { cases, files } = instance;
  const here = `Instance ${number}`;
  if (!Array.isArray(cases) || cases.length === 0 || cases.some((item) => typeof item !== 'string' || !item.trim())) return `${here} needs a list of cases: Python expressions as text.`;
  if (cases.length > MAX_CASES) return `${here} has ${cases.length} cases, and an exam takes at most ${MAX_CASES}.`;
  if (cases.some((item) => item.length > MAX_CASE_LENGTH)) return `${here} has a case longer than ${MAX_CASE_LENGTH} characters.`;
  if (typeof files !== 'object' || files === null || Array.isArray(files) || Object.values(files).some((text) => typeof text !== 'string')) {
    return `${here}'s files have to be text, by name.`;
  }
  if (Object.values(files).reduce((sum, text) => sum + text.length, 0) > MAX_INSTANCE_FILES) return `${here} has more than ${MAX_INSTANCE_FILES} characters of files.`;
}

// ---------- Python ----------

/**
 * A worker thread with Python loaded, and what a task needs from it. Ending the worker is the only
 * way to stop Python, so it starts again after a case that takes too long.
 */
class Python {
  constructor() {
    this.start();
  }

  start() {
    this.worker = new Worker(new URL(import.meta.url));
    this.ready = new Promise((resolve, reject) => {
      this.worker.once('message', resolve);
      this.worker.once('error', reject);
    });
    this.lastId = 0;
  }

  async stop() {
    await this.worker.terminate();
  }

  /** Sends a request to the worker: the outcome is `finished`, with the worker's result, `timed-out` or `crashed`. */
  async ask(request) {
    await this.ready;
    const { worker } = this;
    const id = ++this.lastId;
    const outcome = await new Promise((resolve) => {
      let timer;
      const finish = (result) => {
        clearTimeout(timer);
        worker.off('message', receive);
        worker.off('error', fail);
        resolve(result);
      };
      const receive = (reply) => {
        if (reply.id !== id) return;
        if (reply.type === 'progress') {
          // Each case has CASE_SECONDS, from when it starts.
          clearTimeout(timer);
          timer = setTimeout(() => finish({ status: 'timed-out', number: reply.number }), CASE_SECONDS * 1000);
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
    if (outcome.status !== 'finished') {
      worker.terminate();
      this.start();
    }
    return outcome;
  }

  /** What cases.py makes: `{instances, raises}`, or `{problems}` when it can't. */
  async instances(task) {
    const source = read(task, 'cases.py');
    const fail = (message) => ({ problems: [{ file: 'cases.py', message }] });
    const instances = [];
    let count = DEFAULT_INSTANCES;
    let raises = [];
    for (let index = 0; index < count; index++) {
      const outcome = await this.ask({ type: 'generate', source, index });
      if (outcome.status !== 'finished') return fail(outcome.status === 'timed-out' ? 'It takes too long.' : `Python failed: ${outcome.message}`);
      const { error, cases, files, instances: wanted, raises: allowed } = outcome.result;
      if (error) return fail(error.trimEnd());
      if (index === 0) {
        count = wanted;
        raises = allowed;
        if (count < MIN_INSTANCES) return fail(`INSTANCES is ${count}, and a task needs at least ${MIN_INSTANCES}.`);
      }
      const instance = { cases, files };
      const problem = checkInstance(instance, index + 1);
      if (problem) return fail(problem);
      instances.push(instance);
    }
    const distinct = new Set(instances.map((instance) => JSON.stringify(instance)));
    if (distinct.size !== instances.length) return fail('Two of its instances are the same. Make them differ with the rng, or with the index make() is given.');
    return { instances, raises };
  }

  /** Runs an instance's cases on code: `{observations}`, or `{problem}` when the code stopped before they all ran. */
  async observe(code, instance) {
    const files = Object.fromEntries(Object.entries(instance.files).map(([name, text]) => [name, Buffer.from(text).toString('base64')]));
    const outcome = await this.ask({ type: 'observe', code, cases: JSON.stringify(instance.cases), files: JSON.stringify(files) });
    if (outcome.status === 'timed-out') return { problem: `case ${outcome.number}, ${instance.cases[outcome.number - 1]}, takes longer than ${CASE_SECONDS} seconds.` };
    if (outcome.status === 'crashed') return { problem: `Python failed: ${outcome.message}` };
    const { error, tooMuch, observations } = outcome.result;
    if (error) return { problem: `The code stops with an error before the cases can run:\n${error.trimEnd()}` };
    if (tooMuch) return { problem: 'The code prints so much before the cases can run that it was stopped.' };
    return { observations };
  }

  /** Why code can't be run at all, if it can't: a mistake that stops it before any case runs. */
  async stops(code, instance) {
    const seen = await this.observe(code, { cases: ['0'], files: instance.files });
    return seen.problem && seen.problem.startsWith('The code stops') ? seen.problem : undefined;
  }

  /** The things in the code that the lessons haven't taught, as messages. */
  async lint(code) {
    const outcome = await this.ask({ type: 'lint', code });
    return outcome.status === 'finished' ? outcome.result : [`Python failed while reading it: ${outcome.message ?? 'it took too long'}`];
  }
}

function pyodideDir() {
  return fileURLToPath(new URL('./', import.meta.resolve('pyodide')));
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

// ---------- The worker thread ----------

/** Python for the worker: makes instances from a task's cases.py. */
const GENERATE = String.raw`
import json
import random
import traceback


def generate(source, index):
    try:
        namespace = {'__name__': 'cases'}
        exec(compile(source, 'cases.py', 'exec'), namespace)
        make = namespace.get('make')
        if not callable(make):
            return json.dumps({'error': 'cases.py has to define make(rng, index), which returns {"cases": [...], "files": {...}}.'})
        made = make(random.Random(index), index)
        if not isinstance(made, dict) or 'cases' not in made:
            return json.dumps({'error': 'make() has to return a dictionary with the "cases", and the "files" if there are any.'})
        return json.dumps({
            'cases': made['cases'],
            'files': made.get('files', {}),
            'instances': namespace.get('INSTANCES', ${DEFAULT_INSTANCES}),
            'raises': list(namespace.get('RAISES', [])),
        }, ensure_ascii=False)
    except Exception:
        return json.dumps({'error': traceback.format_exc()})
`;

/**
 * Python for the worker: lists what code uses that the Basics lessons haven't taught. Exam tasks
 * ask for what the lessons teach, so their solutions have to be written with it alone.
 */
const LINT = String.raw`
import ast
import builtins
import json

BUILTINS = {'print', 'input', 'int', 'str', 'len', 'range', 'list', 'sum', 'sorted', 'dict', 'open', 'type', 'ValueError'}
METHODS = {'lower', 'upper', 'strip', 'split', 'join', 'replace', 'append', 'pop', 'items', 'write', 'read', 'sqrt'}
MODULES = {'math'}
STATEMENTS = {
    ast.While: 'while', ast.Break: 'break', ast.Continue: 'continue', ast.Lambda: 'lambda', ast.Try: 'try',
    ast.ClassDef: 'class', ast.Global: 'global', ast.Nonlocal: 'nonlocal', ast.Yield: 'yield', ast.YieldFrom: 'yield',
    ast.Assert: 'assert', ast.Delete: 'del', ast.Match: 'match', ast.IfExp: 'a conditional expression',
    ast.Set: 'a set', ast.SetComp: 'a set comprehension', ast.DictComp: 'a dictionary comprehension',
    ast.GeneratorExp: 'a generator expression', ast.NamedExpr: ':=', ast.Starred: '*',
}


def lint(code):
    tree = ast.parse(code)
    found = []
    defined = set()
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
            defined.add(node.name)
        elif isinstance(node, ast.arg):
            defined.add(node.arg)
        elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
            defined.add(node.id)

    def report(node, what):
        message = (node.lineno, f'line {node.lineno}: {what}, which the lessons do not teach.')
        if message not in found:
            found.append(message)

    for node in ast.walk(tree):
        kind = STATEMENTS.get(type(node))
        if kind:
            report(node, f'it uses {kind}')
        elif isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
            if node.id not in defined and node.id not in BUILTINS and (node.id in dir(builtins)) and node.id != '__name__':
                report(node, f'it uses {node.id}')
        elif isinstance(node, ast.Attribute):
            if node.attr not in METHODS:
                report(node, f'it uses .{node.attr}')
        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            names = [alias.name for alias in node.names] if isinstance(node, ast.Import) else [node.module]
            if isinstance(node, ast.ImportFrom) or any(name not in MODULES for name in names):
                report(node, f'it imports {", ".join(map(str, names))}')
        elif isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Pow, ast.BitAnd, ast.BitOr, ast.BitXor, ast.LShift, ast.RShift, ast.MatMult)):
            report(node, f'it uses the operator {type(node.op).__name__}')
        elif isinstance(node, ast.Slice) and node.step is not None:
            report(node, 'it slices with a step')
        elif isinstance(node, ast.Compare) and len(node.ops) > 1:
            report(node, 'it chains comparisons')
        elif isinstance(node, ast.FormattedValue) and (node.format_spec is not None or node.conversion != -1):
            report(node, 'it formats a value in an f-string')
        elif isinstance(node, ast.Call) and any(keyword.arg is not None for keyword in node.keywords):
            report(node, 'it passes an argument by name')
        elif isinstance(node, ast.FunctionDef) and (node.args.defaults or any(node.args.kw_defaults)):
            report(node, 'it gives a parameter a default value')
    return json.dumps([message for _, message in sorted(found)])
`;

/** The worker thread: loads Pyodide and the harness, then does what it's asked. */
async function serve() {
  const { loadPyodide } = await import('pyodide');
  const { version } = JSON.parse(readFileSync(path.join(pyodideDir(), 'package.json'), 'utf8'));
  const pyodide = await loadPyodide({ indexURL: pyodideDir(), packageBaseUrl: packageBaseUrl(version) });
  const harness = pyodide.globals.get('dict')();
  pyodide.runPython(readFileSync(path.join(ROOT, 'src/scripts/harness.py'), 'utf8'), { globals: harness, filename: 'harness.py' });
  const observe = harness.get('observe');
  const provide = libraryProvider(pyodide, harness.get('provide'));
  const tools = pyodide.globals.get('dict')();
  pyodide.runPython(GENERATE, { globals: tools, filename: 'generate.py' });
  pyodide.runPython(LINT, { globals: tools, filename: 'lint.py' });
  const quiet = { messageCallback: () => {}, errorCallback: () => {} };

  parentPort.on('message', async ({ id, type, ...request }) => {
    try {
      if (type === 'generate') {
        parentPort.postMessage({ id, type: 'done', result: JSON.parse(tools.get('generate')(request.source, request.index)) });
      } else if (type === 'lint') {
        parentPort.postMessage({ id, type: 'done', result: JSON.parse(tools.get('lint')(request.code)) });
      } else {
        await pyodide.loadPackagesFromImports(request.code, quiet);
        await provide(request.code);
        const send = (kind, text) => {
          if (kind === 'check') parentPort.postMessage({ id, type: 'progress', number: Number(text) });
        };
        parentPort.postMessage({ id, type: 'done', result: JSON.parse(observe(request.code, request.cases, request.files, send)) });
      }
    } catch (error) {
      parentPort.postMessage({ id, type: 'crash', message: String(error) });
    }
  });
  parentPort.postMessage({ type: 'ready' });
}

if (isMainThread) {
  process.exitCode = await main();
} else {
  await serve();
}
