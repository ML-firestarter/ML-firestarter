---
description: Write the test cases for a leap-year function, good enough to catch three versions of it that each have a bug.
---

# Write the tests

*Draws on [Testing your code](../../../../notes/02-python/03-errors-and-testing/02-testing-your-code.md) for choosing cases, and on [Conditions and functions](../../../../notes/02-python/01-basics/01-conditions-and-functions.md) for the rules of a leap year.*

This time you don't write the function: you write its **tests**. A year is a leap year when it's divisible by 4, except when it's divisible by 100, unless it's also divisible by 400. `is_leap(year)` is written, and it's right. Three more functions are written too, and each one has a bug that a careless test would miss:

- `ignores_hundreds` forgets the rule about years divisible by 100,
- `ignores_four_hundreds` forgets that years divisible by 400 are leap years after all,
- `uses_two_hundreds` has 200 where it should have 400.

Finish `leap_cases()`, which returns a list of test cases, `(year, expected)`, where `expected` is `True` or `False`. Good cases do two things at once: every case is **right**, so that the correct `is_leap` passes all of them, and the cases between them **catch** each of the three bugs, which means that for each wrong function, at least one case makes it give the wrong answer.

The checks look for these things:

- at least 4 cases, each with a whole-number year and a `True` or `False`, and no year twice,
- the correct `is_leap` gets every case right, and there's a leap year among them, and a year that isn't,
- each of the three wrong functions gets at least one case wrong,
- some case is a year divisible by 100 that isn't a leap year, and some is divisible by 400 that is.

| Case             | Why it's worth having                                       |
| ---------------- | ----------------------------------------------------------- |
| `(2023, False)`  | an ordinary year, which every version gets right            |
| `(1900, False)`  | catches the version that forgets the rule of 100            |

The program under the functions prints each case and whether `is_leap` agrees with it.

> [!TIP]
> Ask of each wrong function: for which years does it differ from the right one? Years divisible by 100 but not by 400 catch two of them, and years divisible by 400 catch the other, and you can check a guess by running the wrong function on it.
