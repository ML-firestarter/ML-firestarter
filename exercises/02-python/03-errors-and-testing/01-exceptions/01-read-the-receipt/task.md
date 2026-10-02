---
description: Read the lines of a shop receipt, add up the good ones and report the bad ones, without stopping at the first mistake.
---

# Read the receipt

*Draws on [Exceptions](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for `raise`, `try`, `except` and `else`, and on [Reading and writing files](../../../../../notes/02-python/01-basics/04-files.md) for `split()`.*

A shop's till prints one item on each line of a receipt: a name and a price, like `tea 3.50`. The prices are typed by hand, so some lines are wrong: a letter where a number should be, a missing price, a blank line. Finish two functions.

`parse_item(line)` returns the item of a line as a list of its name and its price in cents, as a whole number: `parse_item("tea 3.50")` gives `["tea", 350]`. A price can use a comma instead of a dot, as in `2,40`. When the line is wrong, it raises a `ValueError` with a message that says what's wrong:

| The line                    | The message                       |
| --------------------------- | --------------------------------- |
| empty, or only spaces       | `empty line`                      |
| not exactly a name and a price | `expected a name and a price`  |
| a price that isn't a number | `bad price: ` and the price, like `bad price: x` |
| a price below 0             | `negative price`                  |

`read_receipt(lines)` goes through a list of lines, and **doesn't stop** at a wrong one. It returns a dictionary with:

- `"total"`: the sum of the prices of the good lines, in cents,
- `"items"`: how many good lines there were,
- `"problems"`: a list with one `[line_number, message]` for each wrong line, in order, counting the lines from 1.

| Call                                        | Returns                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `read_receipt(["tea 3.50", "jam 2,40"])`    | `{"total": 590, "items": 2, "problems": []}`                            |
| `read_receipt(["tea 3.50", "cake x"])`      | `{"total": 350, "items": 1, "problems": [[2, "bad price: x"]]}`         |

The program under the functions reads a receipt with four wrong lines and prints the result.

> [!TIP]
> `float("x")` raises a `ValueError` of its own, with a message about floats. Catch it inside `parse_item` and raise yours. In `read_receipt`, `except ValueError as error` gives you the error, and `str(error)` its message.
