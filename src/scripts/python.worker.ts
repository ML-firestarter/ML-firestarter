/**
 * Runs readers' Python in Pyodide, away from the page, so code that never ends can't freeze
 * it: the page stops such code by ending this worker (python.ts). Pyodide comes from jsDelivr,
 * at the version in package.json, and runs harness.py, which runs and checks the code. Libraries
 * Pyodide lacks but the lessons use, like PyTorch, are in src/python/ and come with the code that
 * imports them.
 */
import { version } from 'pyodide/package.json';
import harness from './harness.py?raw';
import type { Reply, Request } from './python.ts';

/** Where Pyodide's files are published: the same files as its npm package, which would add 13 MB to every deploy. */
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;

type Harness = (...args: unknown[]) => string;

/** The files of src/python/, each loaded when first wanted, by their paths inside it: "torch/__init__.py". */
const libraries = Object.fromEntries(
  Object.entries(import.meta.glob('../python/**/*.py', { query: '?raw', import: 'default' })).map(([path, load]) => [
    path.replace('../python/', ''),
    load as () => Promise<string>,
  ]),
);
/** The libraries' names: the folders of src/python/. */
const libraryNames = new Set(Object.keys(libraries).map((path) => path.split('/')[0]));
let libraryFilesWritten = false;

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
  return {
    pyodide,
    run: globals.get('run') as Harness,
    check: globals.get('check') as Harness,
    observe: globals.get('observe') as Harness,
    provide: globals.get('provide') as Harness,
  };
}

self.addEventListener('message', async ({ data: request }: MessageEvent<Request>) => {
  const { id } = request;
  const { pyodide, run, check, observe, provide } = await python;
  try {
    // Code that imports a package Pyodide has, like NumPy, gets it first, and so do checks.
    const quiet = { messageCallback: () => {}, errorCallback: () => {} };
    await pyodide.loadPackagesFromImports(request.code, quiet);
    if (request.type === 'check') await pyodide.loadPackagesFromImports(request.checks, quiet);
    // The libraries the page provides, like PyTorch, are written out the first time some code imports one.
    if (!libraryFilesWritten) {
      const sources = request.type === 'check' ? [request.code, request.checks] : [request.code];
      const wanted = sources.flatMap((source) => pyodide.pyodide_py.code.find_imports(source).toJs() as string[]);
      if (wanted.some((name) => libraryNames.has(name))) {
        await pyodide.loadPackage('numpy', quiet);
        const files = Object.fromEntries(await Promise.all(Object.entries(libraries).map(async ([path, load]) => [path, await load()])));
        provide(JSON.stringify(files));
        libraryFilesWritten = true;
      }
    }
    const send = (kind: string, text: string) =>
      reply(kind === 'check' ? { type: 'progress', id, number: Number(text) } : { type: 'output', id, kind: kind as 'out' | 'in' | 'err', text });
    const result =
      request.type === 'run'
        ? run(request.code, request.input, request.files, send)
        : request.type === 'check'
          ? check(request.code, request.checks, request.files, send)
          : observe(request.code, request.cases, request.files, send);
    reply({ type: 'done', id, result: JSON.parse(result) });
  } catch (error) {
    // Python itself failed, like when it runs out of memory; the page starts a new worker.
    reply({ type: 'crash', id, message: String(error) });
  }
});

function reply(message: Reply) {
  self.postMessage(message);
}
