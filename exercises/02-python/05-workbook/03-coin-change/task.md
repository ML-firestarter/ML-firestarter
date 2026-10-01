---
description: Give change in as few notes and coins as possible.
input: 289
---

# Coin change

*Draws on [Ranges and lists](../../../../notes/02-python/01-basics/03-ranges-and-lists.md) for `//` and `%`, and on [Loops and dictionaries](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.md).*

A shop's till has notes and coins worth 100, 50, 20, 10, 5, 2 and 1, as many of each as it needs. To give change with as few pieces as possible, it takes as many pieces of the biggest value as fit in the amount, then as many of the next biggest as fit in what's left, and so on down to 1. For 289, two pieces of 100 fit and 89 is left, one piece of 50 fits in 89 and 39 is left, and so on, until nothing is left. The editor has the list `VALUES`, from the biggest value to the smallest.

Write two functions:

- `make_change(amount)` returns a dictionary with the values the till gives and how many pieces of each, from the biggest value. A value it doesn't need is left out, so `make_change(0)` returns `{}`. A negative amount raises a `ValueError`.
- `piece_count(amount)` returns how many pieces `make_change` gives in all.

| Call               | Returns                                     |
| ------------------ | ------------------------------------------- |
| `make_change(289)` | `{100: 2, 50: 1, 20: 1, 10: 1, 5: 1, 2: 2}` |
| `make_change(7)`   | `{5: 1, 2: 1}`                              |
| `make_change(0)`   | `{}`                                        |
| `make_change(-3)`  | raises `ValueError`                         |
| `piece_count(289)` | `8`                                         |

The program under the functions reads an amount and prints a line like `100 x 2` for each value the till gives, from the biggest, and then how many pieces that makes. With `289` in the **Input** box, it prints:

```text
289
100 x 2
50 x 1
20 x 1
10 x 1
5 x 1
2 x 2
Pieces: 8
```
