/**
 * The libraries the site gives to code that imports them (src/python/): PyTorch, which Pyodide
 * doesn't have, so a small one that runs on NumPy and behaves like it for what the lessons use.
 * The scripts that run Python the way the page does, check-exercises.mjs and exam-tasks.mjs, use
 * this to give them to the code they run, as src/scripts/python.worker.ts does in the browser.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIBRARIES_DIR = fileURLToPath(new URL('../src/python/', import.meta.url));

/** The files of src/python/, by their paths inside it, like "torch/__init__.py". */
export function readLibraryFiles() {
  const files = {};
  for (const entry of readdirSync(LIBRARIES_DIR, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.py')) continue;
    const file = path.join(entry.parentPath, entry.name);
    files[path.relative(LIBRARIES_DIR, file).split(path.sep).join('/')] = readFileSync(file, 'utf8');
  }
  return files;
}

/**
 * Where Pyodide finds the packages it comes with, like NumPy, which the libraries need: its
 * jsDelivr folder. The npm package of Pyodide only has the interpreter, so a script that loads a
 * package needs the network.
 */
export function packageBaseUrl(version) {
  return `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;
}

/**
 * Gives code the libraries it imports: returns a function that, given the code to run (and the
 * code of its checks), loads NumPy and writes the libraries out, once, when some of it imports one.
 * `provide` is harness.py's function of that name.
 */
export function libraryProvider(pyodide, provide) {
  const files = readLibraryFiles();
  const names = new Set(Object.keys(files).map((file) => file.split('/')[0]));
  const quiet = { messageCallback: () => {}, errorCallback: () => {} };
  let written = false;
  return async (...sources) => {
    if (written) return;
    const wanted = sources.flatMap((source) => pyodide.pyodide_py.code.find_imports(source).toJs());
    if (!wanted.some((name) => names.has(name))) return;
    await pyodide.loadPackage('numpy', quiet);
    provide(JSON.stringify(files));
    written = true;
  };
}
