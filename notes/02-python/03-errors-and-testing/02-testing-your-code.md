---
description: Test a function with assert, with small test functions, with unittest and with doctest, and write a test runner of your own.
---

# Testing your code

You write a function, run it on one input, and it looks right. Then someone gives it an empty list. **Tests** are how you find that out first: questions you ask your code, written down with the answers you expect, that you can run again after every change. Every exercise on this site works that way. When you press **Check**, the page calls your functions on a list of cases and compares what they give with what they should.

In this lesson's exercise, you'll write that machinery yourself, a small test runner. You'll need:

- **`assert`**, which stops a program when something that should be true isn't,
- **test functions**, small functions that check one thing each,
- **test cases**, and how to choose them,
- **`unittest` and `doctest`**, two testing tools that come with Python.

## assert

`assert` takes a condition. When it's true, nothing happens. When it's false, the program stops with an `AssertionError`, and an optional message after a comma says what was wrong:

```python run
def median(numbers):
    ordered = sorted(numbers)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


assert median([3, 1, 2]) == 2
assert median([4, 1, 3, 2]) == 2.5, "even number of items"
assert median([5]) == 6, "one item"
print("all good")
```

The first two assertions pass quietly, and the third stops the program before the last line, with `AssertionError: one item` and the line it's on in the traceback. The "all good" at the end is never printed. `assert` is for things that must be true if the code is right, and it checks a program's own work, not what a user types: that's what `if` and `raise` are for.

## Test functions

A test is a function that checks one thing, named for it. A test that fails raises an `AssertionError`, and one that returns without an error passes. A loop that runs the tests, and catches the `AssertionError` of each, can report on all of them instead of stopping at the first:

```python run
def median(numbers):
    ordered = sorted(numbers)
    return ordered[len(ordered) // 2]


def test_odd_count():
    assert median([3, 1, 2]) == 2


def test_even_count():
    assert median([4, 1, 3, 2]) == 2.5


def test_one_item():
    assert median([7]) == 7


tests = [test_odd_count, test_even_count, test_one_item]
for test in tests:
    try:
        test()
        print("pass", test.__name__)
    except AssertionError:
        print("FAIL", test.__name__)
```

This `median` forgets that a list of an even length has two middle items, and the second test finds out. Functions are values, so they can sit in a list, and `test.__name__` is a function's name. Frameworks like the ones below find the tests and do this loop for you.

## Choosing cases

A test is only as good as its cases. It's easy to test what you were thinking about, and the bugs live elsewhere. For every function, try:

- **a typical input**, like `[3, 1, 2]`,
- **the edges**: an empty list, a single item, the smallest and the largest value that should work,
- **both sides of a decision**: if the code has `if n % 2 == 1`, an odd length and an even one,
- **what should fail**: an input that has to raise an error, like an empty list for a median.

Tests for a median function of the exercise's kind, as a list of pairs of the arguments and what it should give:

```python run
cases = [
    (([3, 1, 2],), 2),
    (([4, 1, 3, 2],), 2.5),
    (([7],), 7),
    (([],), ValueError),
]

for arguments, expected in cases:
    print(arguments, "->", expected)
```

The last case expects an **error**, so its "answer" is the class `ValueError` and not a value. The exercise's runner has to tell the two apart. `(arguments,)` is a tuple of one list, the argument list for a function that takes a single argument: `function(*arguments)` spreads a tuple into arguments.

Decimals need care. `0.1 + 0.2 == 0.3` is `False`, because decimals are stored with a tiny error. Compare them with `math.isclose(a, b)`, or round both sides:

```python run
import math

print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(round(0.1 + 0.2, 2) == 0.3)
```

## unittest

`unittest` is a testing tool that comes with Python. Tests are methods of a class that comes from `unittest.TestCase`, and each has a name starting with `test`. A class is a way of bundling functions, which the [Classes lesson](../04-programs/01-classes.md) explains, so for now take its shape as it comes. The `assert...` methods give better messages than a plain `assert`, and `assertRaises` checks that an error is raised:

```python run
import unittest


def median(numbers):
    if len(numbers) == 0:
        raise ValueError("no numbers")
    ordered = sorted(numbers)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


class TestMedian(unittest.TestCase):
    def test_odd(self):
        self.assertEqual(median([3, 1, 2]), 2)

    def test_even(self):
        self.assertEqual(median([4, 1, 3, 2]), 2.5)

    def test_empty(self):
        with self.assertRaises(ValueError):
            median([])

    def test_wrong_on_purpose(self):
        self.assertEqual(median([1, 2]), 2)


unittest.main(argv=["tests"], exit=False)
```

`unittest.main()` finds the tests, runs them and prints a report: a dot for each test that passed, an `F` for each that failed, and for each failure, what it compared and what it found. The report goes to the error output, so the page shows it as error output, even though the program itself ran fine. `argv=["tests"], exit=False` keeps the page from treating the end of the tests as the end of the program.

## doctest

`doctest` takes the tests out of the documentation. A function's docstring, the text in triple quotes right under `def`, can show how it's used, in the form of a Python prompt, `>>>`, with the result on the next line. `doctest.testmod()` runs each one and checks the result:

```python run
def double(x):
    """
    Double a number, or a text.

    >>> double(2)
    4
    >>> double("ab")
    'abab'
    >>> double(3)
    7
    """
    return x * 2


import doctest

print(doctest.testmod())
```

It reports the example that failed, with what it expected and what it got, and then a count: `TestResults(failed=1, attempted=3)`. Doctests are good for short examples that double as documentation, and unittest for more.

## On your computer

The tool most Python projects use is **pytest**. A test is a plain function in a file named `test_something.py`, written as in the section on test functions, with a bare `assert`, and `pytest` finds all of them and reports each one that fails, with the values on both sides. With `uv`, from the [lesson on your computer](../04-programs/03-python-on-your-computer.md):

```bash
uv add --dev pytest
uv run pytest
```

That is the same idea as this lesson's loop, with more care taken. Writing a function's tests *before* the function, from the cases of what it should do, is a good habit, and it's what writing an exercise's checks is.

## Your turn

In [Run the tests](../../../exercises/02-python/03-errors-and-testing/02-testing-your-code/01-run-the-tests/task.md), you'll write a test runner: it calls a function on a list of cases, expects values or errors, and reports each case that went wrong, in words. It's the same job that the **Check** button does on your code.
