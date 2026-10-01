---
description: Check whether a grid of numbers is a Latin square, and build one of any size.
input: "3\n1 2 3\n2 3 1\n3 1 2"
---

# Latin square

*Draws on [Lists of lists](../../../../notes/02-python/01-basics/05-lists-of-lists.md), for lists inside lists and `raise`, [Ranges and lists](../../../../notes/02-python/01-basics/03-ranges-and-lists.md), for `range()` and `%`, and [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md), for `sorted()` and `split()`.*

In a **Latin square** of size `n`, every row and every column holds each of the numbers from 1 to `n` exactly once, like this square of size 3:

```text
1 2 3
2 3 1
3 1 2
```

In the editor a grid is a list of rows, and each row is a list of numbers, so that square is `[[1, 2, 3], [2, 3, 1], [3, 1, 2]]`. Write three functions:

- `column(grid, index)` returns the numbers in the column at `index`, from the top row down, as a list.
- `is_latin_square(grid)` returns `True` for a Latin square and `False` for anything else. That includes a grid that's taller than it's wide or the other way round, a grid with rows of different lengths, and a grid with numbers other than 1 to `n`. The grid always has at least one row.
- `shifted_square(n)` returns the Latin square of size `n` that starts with the row `1, 2, ..., n` and has each next row moved one place to the left, with its first number going round to the end. With `n` less than 1, it raises a `ValueError`.

| Call                                | Returns                              |
| ----------------------------------- | ------------------------------------ |
| `column([[1, 2], [3, 4]], 1)`       | `[2, 4]`                             |
| `is_latin_square([[1, 2], [2, 1]])` | `True`                               |
| `is_latin_square([[1, 2], [1, 2]])` | `False` (the columns repeat numbers) |
| `is_latin_square([[1, 3], [3, 1]])` | `False` (the numbers aren't 1 and 2) |
| `shifted_square(3)`                 | `[[1, 2, 3], [2, 3, 1], [3, 1, 2]]`  |
| `shifted_square(0)`                 | raises `ValueError`                  |

The program under the functions reads `n` and then `n` rows of numbers, with spaces between the numbers, and says whether they make a Latin square. Change the input to try other grids. The input above gives:

```text
Latin square
```

> [!TIP]
> `sorted(row)` puts the numbers of a row in order, and a row that holds 1 to `n` once each is equal to `list(range(1, n + 1))` then. Check the rows first, and return `False` as soon as one is wrong: a row that passes has exactly `n` numbers, so asking for the columns can't run off the end of a row.
