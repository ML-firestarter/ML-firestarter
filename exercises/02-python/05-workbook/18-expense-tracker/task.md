---
description: Write an expense tracker as a class and a command loop, with amounts in cents, an undo, a report and errors that don't stop the program.
---

# Expense tracker

*Draws on [Classes](../../../../notes/02-python/04-programs/01-classes.md) for the class, [Exceptions](../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for the errors, and [Project: a library desk](../../../../notes/02-python/04-programs/04-a-library-desk.md) for the shape of the program.*

A program for keeping track of what you spend, built in the layers of the library desk. Money is kept in whole cents. `money(cents)` is written: it turns `1250` into `"12.50"`. The code also has a start of `Tracker`, which keeps its `entries`, a list of `(cents, category, note)`, and of `desk(tracker)`, which asks for a command with the prompt `> ` and stops at `quit`, printing `Goodbye`. Finish both.

**`Tracker`** has these methods, and raises a `ValueError` with the message in the table:

| Method                          | What it does                                                                                | Error                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `add(amount_text, category, note="")` | turns the amount into cents (a comma works like a dot: `"3,2"` is 320), adds an entry, returns the cents | `bad amount: x` for text that isn't a number, `amount must be positive` for 0 or less |
| `undo()`                        | removes the last entry and returns it as `(cents, category, note)`                          | `nothing to undo` when there are no entries        |
| `totals()`                      | returns `[category, cents]` pairs, with the biggest total first, and alphabetical for equal totals |                                              |
| `total()`                       | returns the sum of all the entries, in cents                                                |                                                    |

**`desk`** answers these commands, in any mix of capitals, and prints each answer under the command:

| Command                        | What it prints                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `add AMOUNT CATEGORY [NOTE]`   | `added 12.50 to food`. The category is kept in lowercase, and the note is the rest of the words |
| `undo`                         | `removed 8.00 from food`                                                              |
| `report`                       | a line `food 20.50` for each category, as `totals()` gives them, and then `total 23.70`, or `no expenses` when there are none |
| `export`                       | the totals as a JSON object of category and cents, with sorted keys: `{"food": 1250}` |
| `quit`                         | `Goodbye`, and the program ends                                                       |

A command that isn't one of these prints `Error: unknown command: fly`, and `add` with fewer than three words prints `Error: usage: add AMOUNT CATEGORY [NOTE]`. A `ValueError` from the tracker prints as `Error: ` and its message, like `Error: bad amount: x`. A line with nothing on it is ignored, and the program ends quietly when the input runs out. None of the errors stops the program.

```text
> add 12.50 Food lunch
added 12.50 to food
> add x food
Error: bad amount: x
> report
food 12.50
total 12.50
> quit
Goodbye
```

The checks call the tracker's methods, and type commands into your program, and compare everything it prints.

> [!TIP]
> Keep the work out of the loop: a function `run_command(tracker, line)` that returns the text to print, or raises `ValueError`, keeps `desk` to reading, a `try`, and printing. `float("3.2")` reads an amount, and `round(float(text) * 100)` makes cents of it.
