---
description: Write a small test runner that calls a function on many cases and says which ones went wrong.
---

# Run the tests

*Draws on [Testing your code](../../../../../notes/02-python/03-errors-and-testing/02-testing-your-code.md) for test cases and what they report, and on [Exceptions](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for `try` and `except`.*

A test runner calls a function on a list of cases and says which ones it got wrong. This is, in small, what the **Check** button of an exercise does. Finish `run_tests(function, cases)`:

- `cases` is a list of pairs, `(arguments, expected)`. `arguments` is a tuple of what to call the function with, like `([3, 1, 2],)`, and `expected` is what it should give.
- When `expected` is an exception class, like `ValueError`, the case expects the function to **raise** that kind of error, or one of a kind that comes from it. The code gives you `is_exception(expected)`, which says whether `expected` is one.
- It returns a list of text, one for each case that went wrong, in order, and `[]` when none did. A case that's right adds nothing.

What a failure says, with the call written as `name(arguments)` and the arguments shown with `repr()`:

| What happened                                          | The text                                              |
| ------------------------------------------------------ | ----------------------------------------------------- |
| it gave a different value                              | `abs(-3) gave 3, expected 4`                          |
| it raised an error that wasn't expected                | `len('abc', 'd') raised TypeError`                    |
| it raised another kind of error than the one expected  | `len(5) raised TypeError, expected ValueError`        |
| it gave a value when an error was expected             | `len('abc') gave 3, expected ValueError`              |

The code also has `median`, a correct function, and `broken_median`, which sorts but forgets the middle of an even list, with `MEDIAN_CASES` to try them on. The program under the functions runs both.

> [!TIP]
> `function.__name__` is the name of a function. `", ".join(repr(a) for a in arguments)` writes the arguments, and `function(*arguments)` calls it with them. A `try` with `except Exception as error` catches what it raises.
