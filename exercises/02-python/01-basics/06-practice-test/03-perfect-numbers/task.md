---
description: Find the numbers that are the sum of their own divisors.
---

# Perfect numbers

*Draws on [Ranges and lists](../../../../../notes/02-python/01-basics/03-ranges-and-lists.md) and [Conditions and functions](../../../../../notes/02-python/01-basics/01-conditions-and-functions.md).*

A divisor of a number divides it evenly: the divisors of 12 are 1, 2, 3, 4, 6 and 12. A number is perfect when it's the sum of its divisors smaller than itself: 6 is 1 + 2 + 3, and 28 is 1 + 2 + 4 + 7 + 14. The number 1 isn't perfect, as it has no divisors smaller than itself. Write three functions:

- `divisors(n)` returns the list of the divisors of `n` that are smaller than `n`, from the smallest.
- `is_perfect(n)` returns `True` when `n` is perfect and `False` otherwise.
- `perfect_numbers(limit)` returns the list of the perfect numbers from 1 to `limit`, both included.

`sum()` adds up the numbers in a list: `sum([1, 2, 3])` is `6`, and `sum([])` is `0`.

| Call                   | Returns           |
| ---------------------- | ----------------- |
| `divisors(12)`         | `[1, 2, 3, 4, 6]` |
| `divisors(7)`          | `[1]`             |
| `is_perfect(28)`       | `True`            |
| `is_perfect(12)`       | `False`           |
| `perfect_numbers(100)` | `[6, 28]`         |
