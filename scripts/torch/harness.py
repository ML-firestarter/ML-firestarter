"""
Checks the page's PyTorch (src/python/torch) against what the real one prints.

A case is a few lines of code that use `torch` and print. `cases/<name>.py` lists them as
`CASES = [(id, code), ...]`, and `golden/<name>.json` holds what real PyTorch printed for each one,
and how it ended: `{id: {"out": ..., "error": ...}}`. Running a case with the page's torch has to give
the same text, give or take the last digit of a number, and the same error, word for word.

    python scripts/torch/harness.py generate       with real PyTorch installed: writes golden/
    python scripts/torch/harness.py check          with NumPy: runs the cases with the page's torch

`npm run check:torch` does the second in Pyodide, the way the page runs it. Both work on Python 3.11
and up. The golden files come from PyTorch 2.14.1 on a computer without a GPU.
"""

import contextlib
import difflib
import io
import json
import os
import re
import shutil
import sys
import tempfile
import warnings

HERE = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else '.'

# Messages that differ on purpose: PyTorch says one thing for a CUDA build that finds no GPU, and the
# page, which has none, says what a build without CUDA says.
SKIP = ('Found no NVIDIA driver',)


def run_case(code):
    """Runs a case, giving what it printed, with its warnings, and how it ended."""
    out = io.StringIO()
    error = None
    namespace = {'__name__': '__case__'}
    try:
        with contextlib.redirect_stdout(out), warnings.catch_warnings(record=True) as caught:
            warnings.simplefilter('always')
            exec('import torch\nimport numpy as np\n' + code, namespace)
        for warning in caught:
            if issubclass(warning.category, DeprecationWarning):
                continue
            first = str(warning.message).splitlines()[0][:120]
            out.write(f'[warning {warning.category.__name__}: {first}]\n')
    except BaseException as caught_error:
        error = f'{type(caught_error).__name__}: {caught_error}'
    return {'out': out.getvalue(), 'error': error}


NUMBER = re.compile(r'[-+]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][-+]?\d+)?|nan|inf')


def _tokens(text):
    text = re.sub(r'0x[0-9a-f]{6,}', '0xADDR', text)
    parts, last = [], 0
    for match in NUMBER.finditer(text):
        parts.append(('text', text[last : match.start()]))
        parts.append(('number', match.group()))
        last = match.end()
    parts.append(('text', text[last:]))
    return parts


def _same_number(x, y):
    try:
        fx, fy = float(x), float(y)
    except ValueError:
        return x == y
    if fx != fx and fy != fy:
        return True
    return fx == fy or abs(fx - fy) <= 2e-4 + 2e-4 * abs(fx)


def same(x, y):
    """Whether two outputs are the same text, with numbers that differ in the last digit or so counting as equal."""
    a, b = _tokens(x), _tokens(y)
    if len(a) != len(b):
        return False
    for (kind_a, value_a), (kind_b, value_b) in zip(a, b):
        if kind_a != kind_b:
            return False
        if kind_a == 'text' and value_a != value_b:
            return False
        if kind_a == 'number' and not _same_number(value_a, value_b):
            return False
    return True


def compare(expected, got):
    """What's different between what real PyTorch gave and what we gave, or None."""
    problems = []
    if (expected['error'] is None) != (got['error'] is None) or (
        expected['error'] is not None and not same(expected['error'], got['error'])
    ):
        problems.append(f"it ended with {got['error']!r} where PyTorch's ended with {expected['error']!r}")
    if not same(expected['out'], got['out']):
        diff = [
            line
            for line in difflib.unified_diff(
                expected['out'].splitlines(), got['out'].splitlines(), 'PyTorch', 'page', lineterm='', n=0
            )
            if not line.startswith(('---', '+++', '@@'))
        ]
        problems.append('what it printed differs:\n    ' + '\n    '.join(diff[:8]))
    return problems or None


@contextlib.contextmanager
def scratch_folder():
    """A folder of its own to run cases in, since some write files."""
    before = os.getcwd()
    folder = tempfile.mkdtemp()
    os.chdir(folder)
    try:
        yield
    finally:
        os.chdir(before)
        shutil.rmtree(folder, ignore_errors=True)


def load_cases(source):
    namespace = {}
    exec(compile(source, 'cases', 'exec'), namespace)
    return namespace['CASES']


def check_corpus(cases_source, golden_source):
    """Runs a corpus's cases and returns JSON: how many there were, and for each that differs, what's different."""
    golden = json.loads(golden_source)
    failures = {}
    cases = load_cases(cases_source)
    with scratch_folder():
        for case_id, code in cases:
            expected = golden[case_id]
            if expected['error'] and any(text in expected['error'] for text in SKIP):
                continue
            problems = compare(expected, run_case(code))
            if problems:
                failures[case_id] = problems
    return json.dumps({'cases': len(cases), 'failures': failures})


def generate_corpus(cases_source):
    with scratch_folder():
        return json.dumps({case_id: run_case(code) for case_id, code in load_cases(cases_source)}, indent=1)


def main(argv):
    if len(argv) < 2 or argv[1] not in ('generate', 'check'):
        print(__doc__)
        return 2
    action = argv[1]
    names = argv[2:] or sorted(name[:-3] for name in os.listdir(os.path.join(HERE, 'cases')) if name.endswith('.py'))
    if action == 'check':
        # The page's torch, found where the site keeps it.
        sys.path.insert(0, os.path.abspath(os.path.join(HERE, '..', '..', 'src', 'python')))
    failed = 0
    for name in names:
        with open(os.path.join(HERE, 'cases', name + '.py'), encoding='utf-8') as file:
            cases_source = file.read()
        golden_path = os.path.join(HERE, 'golden', name + '.json')
        if action == 'generate':
            import torch

            print(f'{name}: writing what PyTorch {torch.__version__} prints for {len(load_cases(cases_source))} cases')
            with open(golden_path, 'w', encoding='utf-8') as file:
                file.write(generate_corpus(cases_source))
            continue
        with open(golden_path, encoding='utf-8') as file:
            report = json.loads(check_corpus(cases_source, file.read()))
        print(f"{name}: {report['cases'] - len(report['failures'])} of {report['cases']} cases give what PyTorch gives")
        for case_id, problems in report['failures'].items():
            failed += 1
            print(f'  ✗ {case_id}')
            for problem in problems:
                print('    ' + problem)
    return 1 if failed else 0


if globals().get('__name__') == '__main__':
    sys.exit(main(sys.argv))
