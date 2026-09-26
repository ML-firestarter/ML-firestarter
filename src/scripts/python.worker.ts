/**
 * Runs readers' Python in Pyodide, away from the page, so code that never ends can't freeze
 * it: the page stops such code by ending this worker (python.ts). Pyodide comes from jsDelivr,
 * at the version in package.json, and runs harness.py, which runs and checks the code.
 */
import { version } from 'pyodide/package.json';
import harness from './harness.py?raw';
import type { Reply, Request } from './python.ts';

/** Where Pyodide's files are published: the same files as its npm package, which would add 13 MB to every deploy. */
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;

type Harness = (...args: unknown[]) => string;

const python = load();
python.then(
  () => reply({ type: 'ready' }),
  (error) => reply({ type: 'failed', message: String(error) }),
);

async function load() {
  const { loadPyodide }: typeof import('pyodide') = await import(/* @vite-ignore */ `${INDEX_URL}pyodide.mjs`);
  const pyodide = await loadPyodide({ indexURL: INDEX_URL });
  const globals = pyodide.globals.get('dict')();
  pyodide.runPython(harness, { globals, filename: 'harness.py' });
  return { pyodide, run: globals.get('run') as Harness, check: globals.get('check') as Harness };
}

self.addEventListener('message', async ({ data: request }: MessageEvent<Request>) => {
  const { id } = request;
  const { pyodide, run, check } = await python;
  try {
    // Code that imports a package Pyodide has, like NumPy, gets it first, and so do checks.
    const quiet = { messageCallback: () => {}, errorCallback: () => {} };
    await pyodide.loadPackagesFromImports(request.code, quiet);
    if (request.type === 'check') await pyodide.loadPackagesFromImports(request.checks, quiet);
    const send = (kind: string, text: string) =>
      reply(kind === 'check' ? { type: 'progress', id, number: Number(text) } : { type: 'output', id, kind: kind as 'out' | 'in' | 'err', text });
    const result =
      request.type === 'run' ? run(request.code, request.input, request.files, send) : check(request.code, request.checks, request.files, send);
    reply({ type: 'done', id, result: JSON.parse(result) });
  } catch (error) {
    // Python itself failed, like when it runs out of memory; the page starts a new worker.
    reply({ type: 'crash', id, message: String(error) });
  }
});

function reply(message: Reply) {
  self.postMessage(message);
}
