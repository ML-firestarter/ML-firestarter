---
description: Reduce fractions to lowest terms, add them, and write the result as a mixed number.
input: "3/4\n5/6"
---

# Fractions

*Draws on [Ranges and lists](../../../../notes/02-python/01-basics/03-ranges-and-lists.md), for `range()`, `//` and `%`, [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md), for `split()`, and [Lists of lists](../../../../notes/02-python/01-basics/05-lists-of-lists.md), for `raise`.*

Three quarters is written in the editor as a list of two numbers, `[3, 4]`: the top and the bottom. Write four functions to work with fractions like that:

- `gcd(a, b)` returns the greatest common divisor of two whole numbers that are 1 or more: the biggest number that divides both `a` and `b` with nothing left over. `gcd(12, 18)` is `6`.
- `simplify(top, bottom)` returns the fraction in lowest terms, as a list `[top, bottom]`, with a bottom that's always positive: when the fraction is negative, the minus sign is on the top. Zero is `[0, 1]`. A bottom of 0 raises a `ValueError`.
- `add(first, second)` takes two fractions, each a list `[top, bottom]` with a bottom that isn't 0, and returns their sum in lowest terms.
- `to_text(fraction)` writes a fraction as text, in lowest terms. A fraction bigger than 1 becomes a mixed number, a whole part and then what's left over, like `1 1/2`, and one that comes out whole is just that number, like `2`. For a negative fraction the minus sign comes first, like `-1 1/2`.

| Call                  | Returns             |
| --------------------- | ------------------- |
| `gcd(12, 18)`         | `6`                 |
| `simplify(6, 8)`      | `[3, 4]`            |
| `simplify(6, -8)`     | `[-3, 4]`           |
| `simplify(0, 5)`      | `[0, 1]`            |
| `simplify(1, 0)`      | raises `ValueError` |
| `add([1, 2], [1, 3])` | `[5, 6]`            |
| `add([1, 4], [3, 4])` | `[1, 1]`            |
| `to_text([5, 6])`     | `'5/6'`             |
| `to_text([7, 2])`     | `'3 1/2'`           |
| `to_text([-7, 2])`    | `'-3 1/2'`          |
| `to_text([6, 3])`     | `'2'`               |

The program under the functions reads two fractions, each on its own line and written with a slash like `3/4`, and prints their sum. Once your functions work, the input `3/4` and `5/6` gives:

```text
3/4 + 5/6 = 1 7/12
```

> [!TIP]
> `//` and `%` round down, so `-7 // 2` is `-4` and `-7 % 2` is `1`. With a negative top, take the minus sign off before you split it into a whole part and a rest, and put it back in front of the text at the end.
