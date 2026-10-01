---
description: Turn seconds into text like 1h 2m 5s, and text like that back into seconds.
---

# Stopwatch

*Draws on [Ranges and lists](../../../../notes/02-python/01-basics/03-ranges-and-lists.md) for `//`, `%` and `join()`, [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md) for `split()`, and [Lists of lists](../../../../notes/02-python/01-basics/05-lists-of-lists.md) for slices and `raise`.*

A stopwatch shows a time like `1h 2m 5s`. Write two functions that convert between that and a number of seconds:

- `format_time(seconds)` returns the time as text, with hours, minutes and seconds, leaving out the parts that are 0: 3600 seconds is `1h`, not `1h 0m 0s`. Zero seconds is `0s`, as there would be nothing to show otherwise. There are no days: 90000 seconds is `25h`. A negative number of seconds raises a `ValueError`.
- `parse_time(text)` does the opposite. `text` is made of parts like `1h`, `2m` and `5s`, separated by spaces: each one is a whole number followed by its unit, `h`, `m` or `s`, and they come in any order. The function returns the seconds of all of them together. Empty text is 0 seconds. A part with another unit, like `5x`, raises a `ValueError`.

| Call                     | Returns             |
| ------------------------ | ------------------- |
| `format_time(3725)`      | `'1h 2m 5s'`        |
| `format_time(3600)`      | `'1h'`              |
| `format_time(0)`         | `'0s'`              |
| `format_time(-1)`        | raises `ValueError` |
| `parse_time("1h 2m 5s")` | `3725`              |
| `parse_time("45s 1m")`   | `105`               |
| `parse_time("5x")`       | raises `ValueError` |

Formatting a time and then parsing the text should give back the number of seconds you started with.

> [!TIP]
> In a part like `12m`, the unit is its last character, `part[-1]`, and the number is everything before it, `part[:-1]`, which `int()` turns into a number.
