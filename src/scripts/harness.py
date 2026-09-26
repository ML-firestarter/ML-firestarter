"""
Runs readers' Python for the site: the code in an exercise's editor (ExerciseView.astro) and
the lessons' runnable examples. The browser's worker (python.worker.ts) and the exercises' CI
check (scripts/check-exercises.mjs) load it into Pyodide and call `run` or `check`.

The code runs as a file called main.py, in a folder of its own next to the exercise's files,
the way `python main.py` runs it in a terminal: tracebacks show the reader's lines and none of
this file's, and input() reads the lines of the page's input box, showing each one after its
prompt as if it had been typed.
"""

import ast
import base64
import builtins
import contextlib
import importlib
import io
import itertools
import json
import linecache
import math
import os
import shutil
import sys
import time
import traceback
import types

FILENAME = 'main.py'
# The folder the code runs in, emptied before every run.
FOLDER = '/home/pyodide/exercise'
# How much a run can print before it's stopped, so a loop that prints forever can't freeze the page.
OUTPUT_LIMIT = 200_000
# How much the code can print during each check.
CHECK_OUTPUT_LIMIT = 50_000
# A run sends the page each line as it's printed, but no more than SENDS_AT_ONCE times in each
# SEND_EVERY seconds, so that a loop that prints fast can't flood it.
SEND_EVERY = 0.05
SENDS_AT_ONCE = 20
# This file's name in tracebacks, whatever it was loaded as.
HARNESS = sys._getframe().f_code.co_filename

# Whether the reader's input() found no line left to read, since the run started.
ran_out = False


# ---------- Running a program ----------


def run(code, typed, files, send):
    """
    Runs the reader's code as a program, with `typed` as what's typed in, and calls `send(kind,
    text)` with what it prints as it goes: 'out' for its output, 'in' for the lines it reads and
    'err' for errors. Returns how it ended, as JSON: `status` is 'done', 'error' or
    'too-much-output', and `ranOut` says whether the error was input() finding no line to read.
    """
    global ran_out
    ran_out = False
    sink = Sink(OUTPUT_LIMIT, send)
    status, error = 'done', None
    fill_folder(code, decode(files))
    try:
        with redirected(sink, typed):
            run_main(compile(code, FILENAME, 'exec'))
    except TooMuchOutput:
        status = 'too-much-output'
    except BaseException as caught:
        status, error = 'error', caught
        sink.add('err', describe(caught), force=True)
    sink.flush()
    return json.dumps({'status': status, 'ranOut': ran_out and isinstance(error, EOFError)})


def run_main(code):
    """Runs compiled code as the program, like `python main.py`; exit() and sys.exit() end it quietly."""
    main = types.ModuleType('__main__')
    main.__file__ = os.path.join(FOLDER, FILENAME)
    saved = sys.modules.get('__main__')
    sys.modules['__main__'] = main
    try:
        exec(code, main.__dict__)
    except SystemExit as exit:
        # sys.exit('message') prints the message; a number is the exit status, which a terminal doesn't show.
        if exit.code is not None and not isinstance(exit.code, int):
            print(exit.code, file=sys.stderr)
    finally:
        if saved is not None:
            sys.modules['__main__'] = saved


def read_input(prompt=''):
    """input() for the reader's code: the next line of the input box, shown after the prompt as if it had been typed."""
    global ran_out
    sys.stdout.write(str(prompt))
    line = sys.stdin.readline()
    if not line:
        ran_out = True
        raise EOFError('EOF when reading a line')
    line = line.removesuffix('\n')
    if isinstance(sys.stdout, Stream):
        sys.stdout.sink.add('in', line + '\n')
    return line


# ---------- Checking an exercise ----------


def raises(error):
    """What a check expects when its expression should raise an error: `raises(ValueError)`."""
    if not (isinstance(error, type) and issubclass(error, BaseException)):
        raise TypeError(f'raises() takes a kind of error, like raises(ValueError), not {error!r}')
    return Raises(error)


def prints(text):
    """What a check expects when its expression should print some text: `prints('Hello!\\n')`."""
    if not isinstance(text, str):
        raise TypeError(f'prints() takes the text to print, like prints("Hello!\\n"), not {text!r}')
    return Prints(text)


class Raises:
    def __init__(self, error):
        self.error = error


class Prints:
    def __init__(self, text):
        self.text = text


class BrokenChecks(Exception):
    """A mistake in an exercise's checks.py, rather than in the reader's code."""


class Check:
    """One of an exercise's checks: an expression, and the value, error or output it should give."""

    def __init__(self, number, expression, expected):
        self.expression = expression.strip()
        self.expected = expected
        try:
            tree = ast.parse(self.expression, mode='eval')
        except SyntaxError as error:
            raise BrokenChecks(f'Check {number}, {expression!r}, is not a Python expression: {error.msg}.') from None
        self.code = compile(tree, '<check>', 'eval')
        self.kind = 'raises' if isinstance(expected, Raises) else 'prints' if isinstance(expected, Prints) else 'value'
        call = tree.body
        # program('3', '4') runs the reader's code as a program, with those lines typed in.
        self.program = isinstance(call, ast.Call) and isinstance(call.func, ast.Name) and call.func.id == 'program'
        self.inputs = None
        if self.program:
            with contextlib.suppress(Exception):
                self.inputs = [str(ast.literal_eval(argument)) for argument in call.args]


def read_checks(source):
    """The checks in an exercise's checks.py, which sets CHECKS to a list of (expression, expected) pairs."""
    namespace = {'__name__': 'checks', 'raises': raises, 'prints': prints}
    try:
        exec(compile(source, 'checks.py', 'exec'), namespace)
    except Exception as error:
        raise BrokenChecks(f'checks.py raised {type(error).__name__}: {error}') from None
    listed = namespace.get('CHECKS')
    if not isinstance(listed, (list, tuple)) or not listed:
        raise BrokenChecks('checks.py has to set CHECKS to a list of checks, like CHECKS = [("area(2, 3)", 6)].')
    checks = []
    for number, item in enumerate(listed, start=1):
        if not (isinstance(item, tuple) and len(item) == 2 and isinstance(item[0], str)):
            raise BrokenChecks(
                f'Check {number} has to be a pair of an expression, written as a string, and what it should give, '
                f'like ("area(2, 3)", 6), not {item!r}.'
            )
        checks.append(Check(number, *item))
    return checks


def check(code, source, files, send):
    """
    Runs an exercise's checks, from its checks.py (`source`), on the reader's code. Returns JSON
    with `results`, one for each check, or `error`, what stopped the code before the checks could
    run, or `broken`, a mistake in checks.py. Calls `send('check', number)` as each check starts,
    so that the page can tell which one ran out of time.
    """
    try:
        checks = read_checks(source)
    except BrokenChecks as problem:
        return json.dumps({'broken': str(problem)})

    attempt = Attempt(code, decode(files))
    try:
        attempt.compile()
    except SyntaxError as error:
        return json.dumps({'error': describe(error), 'results': []})

    results = []
    for number, item in enumerate(checks, start=1):
        send('check', str(number))
        if not item.program and attempt.module is None:
            error = attempt.load()
            if error:
                return json.dumps({**error, 'results': results}, ensure_ascii=False)
        results.append(attempt.evaluate(item))
    return json.dumps({'results': results}, ensure_ascii=False)


class Attempt:
    """The reader's code, being checked."""

    def __init__(self, code, files):
        self.code = code
        self.files = files
        self.compiled = None
        # The code run as a module called `exercise`, whose functions checks call; loaded for the first such check.
        self.module = None

    def compile(self):
        fill_folder(self.code, self.files)
        # Warnings, like SyntaxWarning, go nowhere.
        with redirected(Sink(CHECK_OUTPUT_LIMIT)):
            self.compiled = compile(self.code, FILENAME, 'exec')

    def load(self):
        """Runs the code as a module; returns what stopped it, if something did."""
        fill_folder(self.code, self.files)
        module = types.ModuleType('exercise')
        module.__file__ = os.path.join(FOLDER, FILENAME)
        try:
            with redirected(Sink(CHECK_OUTPUT_LIMIT)):
                sys.modules['exercise'] = module
                exec(self.compiled, module.__dict__)
        except TooMuchOutput:
            return {'tooMuch': True}
        except BaseException as error:
            return {'error': describe(error)}
        self.module = module

    def program(self, *lines):
        """program('3', '4') in a check: runs the code as a program, in a fresh folder, with those lines typed in."""
        fill_folder(self.code, self.files)
        sys.stdin = io.StringIO(''.join(f'{line}\n' for line in lines))
        run_main(self.compiled)

    def evaluate(self, item):
        sink = Sink(CHECK_OUTPUT_LIMIT)
        result = {
            'expression': item.expression,
            'kind': item.kind,
            'program': item.program,
            'inputs': item.inputs,
            'expected': expected_text(item.expected),
            'ok': False,
            # The value the expression gave, or what it printed for checks of what it prints.
            'got': None,
            # Everything printed while it ran.
            'printed': '',
            # The error it raised, on one line, and its traceback.
            'raised': None,
            'trace': None,
            # For checks of what it prints: the first line that's different.
            'line': None,
            'tooMuch': False,
        }
        value, error, returned = None, None, False
        try:
            with redirected(sink):
                if item.program:
                    namespace = {'program': self.program}
                else:
                    sys.modules['exercise'] = self.module
                    namespace = self.module.__dict__
                value = eval(item.code, namespace)
                returned = True
        except TooMuchOutput:
            result['tooMuch'] = True
        except BaseException as caught:
            error = caught
            result['raised'] = traceback.format_exception_only(caught)[-1].strip()
            result['trace'] = describe(caught)

        printed = sink.text()
        result['printed'] = printed
        expected = item.expected
        if item.kind == 'raises':
            result['ok'] = isinstance(error, expected.error)
            if returned:
                result['got'] = shown(value)
        elif item.kind == 'prints':
            want, got = tidy(expected.text), tidy(printed)
            result['got'] = '\n'.join(got)
            result['ok'] = returned and want == got
            if want != got:
                result['line'] = first_difference(want, got)
        elif returned:
            result['got'] = shown(value)
            result['ok'] = same(value, expected)
        return result


def expected_text(expected):
    if isinstance(expected, Raises):
        return expected.error.__name__
    if isinstance(expected, Prints):
        return '\n'.join(tidy(expected.text))
    return shown(expected)


def same(got, expected):
    """Whether a value is the one a check expects: numbers may differ by rounding, and True, False and None have to be themselves."""
    if expected is None or isinstance(expected, bool) or isinstance(got, bool):
        return got is expected
    if isinstance(expected, float) or (isinstance(expected, int) and isinstance(got, float)):
        return isinstance(got, (int, float)) and math.isclose(got, expected, rel_tol=1e-9, abs_tol=1e-12)
    if isinstance(expected, (list, tuple)):
        return type(got) is type(expected) and len(got) == len(expected) and all(map(same, got, expected))
    if isinstance(expected, dict):
        return isinstance(got, dict) and got.keys() == expected.keys() and all(same(got[key], expected[key]) for key in expected)
    try:
        return bool(got == expected)
    except Exception:
        return False


def tidy(text):
    """Printed text as checks compare it, in lines: spaces at the ends of lines and blank lines at the end don't count."""
    lines = [line.rstrip() for line in text.replace('\r\n', '\n').split('\n')]
    while lines and not lines[-1]:
        lines.pop()
    return lines


def first_difference(want, got):
    """The first line that differs, counted from 1; `expected` or `got` is None where there's no such line."""
    for number, (expected, actual) in enumerate(itertools.zip_longest(want, got), start=1):
        if expected != actual:
            return {'number': number, 'expected': expected, 'got': actual}


def shown(value):
    """A value as Python writes it, cut short when it's long."""
    try:
        text = repr(value)
    except Exception:
        text = object.__repr__(value)
    return text if len(text) <= 300 else text[:299] + '…'


# ---------- What both need ----------


class TooMuchOutput(BaseException):
    """Stops code that printed more than it may. It's a BaseException, so `except Exception` doesn't catch it."""


class Sink:
    """
    What the code prints, in pieces of one kind each: 'out' for its output, 'in' for the lines it
    reads and 'err' for errors. With `send`, a run sends the pieces to the page as each line ends,
    the way a terminal shows them, so that a program stuck in a loop shows how far it got. After
    SENDS_AT_ONCE sends in SEND_EVERY seconds, the lines wait for the first one after that.
    """

    def __init__(self, limit, send=None):
        self.limit = limit
        self.send = send
        self.pieces = []
        self.size = 0
        self.since = time.monotonic()
        self.sends = 0

    def add(self, kind, text, *, force=False):
        room = self.limit - self.size
        if not force and len(text) > room:
            self.add(kind, text[: max(room, 0)], force=True)
            self.flush()
            raise TooMuchOutput
        if not text:
            return
        if self.pieces and self.pieces[-1][0] == kind:
            self.pieces[-1][1].append(text)
        else:
            self.pieces.append((kind, [text]))
        self.size += len(text)
        if '\n' in text:
            self.pass_on()

    def pass_on(self):
        """Sends what's printed so far, unless the page has had enough sends lately."""
        if not self.send:
            return
        now = time.monotonic()
        if now - self.since >= SEND_EVERY:
            self.since, self.sends = now, 0
        if self.sends < SENDS_AT_ONCE:
            self.sends += 1
            self.flush()

    def flush(self):
        if self.send:
            for kind, texts in self.pieces:
                self.send(kind, ''.join(texts))
            self.pieces = []

    def text(self):
        """Everything printed; for checks, whose sink sends nothing."""
        return ''.join(''.join(texts) for kind, texts in self.pieces)


class Stream(io.TextIOBase):
    """sys.stdout or sys.stderr while the reader's code runs."""

    encoding = 'utf-8'

    def __init__(self, sink, kind):
        super().__init__()
        self.sink = sink
        self.kind = kind

    def writable(self):
        return True

    def write(self, text):
        if not isinstance(text, str):
            raise TypeError(f'write() argument must be str, not {type(text).__name__}')
        self.sink.add(self.kind, text)
        return len(text)

    def flush(self):
        # print(..., flush=True) shows a line that isn't finished yet, like a prompt.
        self.sink.pass_on()


@contextlib.contextmanager
def redirected(sink, typed=''):
    """Runs the block with what the code prints going to `sink`, and `typed` as the lines input() reads."""
    saved = sys.stdin, sys.stdout, sys.stderr, sys.argv, builtins.input, list(sys.path)
    sys.stdin = io.StringIO(typed.replace('\r\n', '\n'))
    sys.stdout = Stream(sink, 'out')
    sys.stderr = Stream(sink, 'err')
    sys.argv = [FILENAME]
    builtins.input = read_input
    # Like `python main.py`, the code can import the modules next to it.
    sys.path.insert(0, FOLDER)
    importlib.invalidate_caches()
    try:
        yield
    finally:
        sys.stdin, sys.stdout, sys.stderr, sys.argv, builtins.input, sys.path[:] = saved
        # The next run imports them afresh, as they may have changed.
        for name, module in list(sys.modules.items()):
            if (getattr(module, '__file__', None) or '').startswith(FOLDER + '/'):
                del sys.modules[name]


def fill_folder(code, files):
    """Empties the folder the code runs in, and puts the code, as main.py, and the exercise's files in it."""
    os.chdir('/')
    shutil.rmtree(FOLDER, ignore_errors=True)
    os.makedirs(FOLDER)
    for name, data in files.items():
        path = os.path.join(FOLDER, name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'wb') as file:
            file.write(data)
    with open(os.path.join(FOLDER, FILENAME), 'w', encoding='utf-8') as file:
        file.write(code)
    os.chdir(FOLDER)
    # Tracebacks quote the lines they point at from here.
    linecache.cache[FILENAME] = (len(code), None, code.splitlines(True), FILENAME)


def decode(files):
    """The exercise's files, sent as JSON with each file's contents in base64."""
    return {name: base64.b64decode(data) for name, data in json.loads(files or '{}').items()}


def describe(error):
    """The traceback Python prints for an error in the reader's code, without this file's lines."""
    report = traceback.TracebackException.from_exception(error)
    trim(report)
    return ''.join(report.format())


def trim(report):
    """Leaves out the frames before the reader's code starts, and this file's."""
    frames = list(report.stack)
    while frames and frames[0].filename != FILENAME:
        frames.pop(0)
    report.stack = traceback.StackSummary.from_list([frame for frame in frames if frame.filename != HARNESS])
    for other in (report.__cause__, report.__context__, *(report.exceptions or ())):
        if other is not None:
            trim(other)
