---
description: Pick the kind of error, its message, and the function and line it happened in, out of the text of a traceback.
---

# Read the traceback

*Draws on [Exceptions](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for reading a traceback, and on [Modules and the standard library](../../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.md) for `re`.*

When a program stops with an error, Python prints a **traceback**: the calls that led to the error, from the outermost to the innermost, and then what went wrong. The last `File` line is where it happened, and the last line of all is the error. Finish `where_it_failed(text)`, which takes the text of a traceback and returns a dictionary with:

- `"error"`: the kind of error, like `ZeroDivisionError`,
- `"message"`: what comes after the colon on the last line, or `""` when the error has no message,
- `"function"`: the name of the function in the last `File` line, which is `<module>` when the error happened outside of any function,
- `"line"`: the line number in the last `File` line, as a whole number.

The code gives you `FRAME`, a regular expression for a `File` line, with the groups `file`, `line` and `function`, and the tracebacks of the table as `AVERAGE`, `MISSING_KEY`, `BAD_PRICE`, `BARE_RAISE` and `NO_FILE`.

| Call                          | Returns                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `where_it_failed(AVERAGE)`    | `{"error": "ZeroDivisionError", "message": "division by zero", "function": "average", "line": 7}`           |
| `where_it_failed(BARE_RAISE)` | `{"error": "ValueError", "message": "", "function": "<module>", "line": 3}`                                 |

Try `print(AVERAGE)` to see one of them. The text may have blank lines or a newline around it, which `strip()` takes off, and the message can itself have a colon in it, so split the last line at the **first** `": "` only.

> [!TIP]
> `text.partition(": ")` splits at the first colon and gives three parts, and with no colon, the last two are empty. `FRAME.search(line)` gives `None` for a line that isn't a `File` line.
