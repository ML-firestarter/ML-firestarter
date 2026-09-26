---
description: Tell leap years from the others, and list the leap years between two years.
---

# Leap years

*Draws on [Conditions and functions](../../../../../notes/02-python/01-basics/01-conditions-and-functions.md) and [Ranges and lists](../../../../../notes/02-python/01-basics/03-ranges-and-lists.md).*

A leap year has a 29th of February. A year is a leap year when it divides evenly by 4, except for the years that divide by 100: those are leap years only when they divide by 400 too. So 2024 is a leap year and 2023 isn't, and 1900 isn't one but 2000 is.

Write two functions:

- `is_leap(year)` returns `True` for a leap year and `False` for any other year.
- `leap_years(start, end)` returns the list of the leap years from `start` to `end`, both included, from the earliest.

| Call                     | Returns                    |
| ------------------------ | -------------------------- |
| `is_leap(2024)`          | `True`                     |
| `is_leap(1900)`          | `False`                    |
| `is_leap(2000)`          | `True`                     |
| `leap_years(1896, 1912)` | `[1896, 1904, 1908, 1912]` |
| `leap_years(2001, 2003)` | `[]`                       |
