/**
 * Checks the PyTorch the site gives to code that imports it (src/python/torch) against what the
 * real PyTorch prints: the cases in scripts/torch/cases/ are run with it, in Pyodide from
 * node_modules, as the page runs them, and what they print is compared with what real PyTorch
 * printed, kept in scripts/torch/golden/. A number may differ in its last digit or so; the rest,
 * and every error message, has to be the same.
 *
 *   npm run check:torch                 checks every set of cases
 *   npm run check:torch -- nn metrics   checks only those
 *
 * To make a new case, add it to a file in scripts/torch/cases/ and write what real PyTorch prints
 * for it into golden/, which takes a computer with PyTorch: `python scripts/torch/harness.py generate`.
 * Pull requests that change the library run this too (.github/workflows/check-torch.yml).
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { libraryProvider, packageBaseUrl } from './libraries.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CASES_DIR = path.join(ROOT, 'scripts/torch/cases');
const GOLDEN_DIR = path.join(ROOT, 'scripts/torch/golden');
/** Packages that Pyodide comes with, which some sets of cases need besides NumPy. */
const NEEDS = { scripts: ['scikit-learn'] };

const { loadPyodide } = await import('pyodide');
const pyodideDir = fileURLToPath(new URL('./', import.meta.resolve('pyodide')));
const { version } = JSON.parse(readFileSync(path.join(pyodideDir, 'package.json'), 'utf8'));
console.log(`Checking the page's PyTorch with Pyodide ${version}…\n`);
const pyodide = await loadPyodide({ indexURL: pyodideDir, packageBaseUrl: packageBaseUrl(version) });

// The library comes the way it does in the page, from harness.py's `provide`.
const site = pyodide.globals.get('dict')();
pyodide.runPython(readFileSync(path.join(ROOT, 'src/scripts/harness.py'), 'utf8'), { globals: site, filename: 'harness.py' });
await libraryProvider(pyodide, site.get('provide'))('import torch');

const tools = pyodide.globals.get('dict')();
pyodide.runPython(readFileSync(path.join(ROOT, 'scripts/torch/harness.py'), 'utf8'), { globals: tools, filename: 'harness.py' });
const checkCorpus = tools.get('check_corpus');

const available = readdirSync(CASES_DIR).filter((file) => file.endsWith('.py')).map((file) => file.slice(0, -3)).sort();
const wanted = process.argv.slice(2);
const names = wanted.length ? available.filter((name) => wanted.includes(name)) : available;
if (names.length === 0) {
  console.error(`There are no such cases. The sets are ${available.join(', ')}.`);
  process.exit(1);
}

let failed = 0;
let total = 0;
for (const name of names) {
  const needs = NEEDS[name] ?? [];
  if (needs.length) await pyodide.loadPackage(needs, { messageCallback: () => {}, errorCallback: () => {} });
  const cases = readFileSync(path.join(CASES_DIR, `${name}.py`), 'utf8');
  const golden = readFileSync(path.join(GOLDEN_DIR, `${name}.json`), 'utf8');
  const report = JSON.parse(checkCorpus(cases, golden));
  const failures = Object.entries(report.failures);
  total += report.cases;
  failed += failures.length;
  console.log(`${failures.length ? '✗' : '✓'} ${name}: ${report.cases - failures.length} of ${report.cases} cases give what PyTorch gives`);
  for (const [id, problems] of failures) {
    console.log(`    ${id}`);
    for (const problem of problems) {
      console.log(problem.replace(/^/gm, '      '));
      annotate(path.join(CASES_DIR, `${name}.py`), `${id}: ${problem}`);
    }
  }
}
console.log(failed ? `\n${failed} of ${total} cases differ from PyTorch.` : `\nAll ${total} cases give what PyTorch gives.`);
process.exit(failed ? 1 : 0);

/** Marks the file on the pull request, when GitHub Actions runs this. */
function annotate(file, message) {
  if (process.env.GITHUB_ACTIONS !== 'true') return;
  const escape = (text) => text.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  console.log(`::error file=${escape(path.relative(ROOT, file).split(path.sep).join('/'))}::${escape(message)}`);
}
