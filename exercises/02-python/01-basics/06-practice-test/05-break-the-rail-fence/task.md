---
description: Undo the rail fence cipher and get the hidden message back.
---

# Break the rail fence

*Draws on every lesson in Basics, [Lists of lists](../../../../../notes/02-python/01-basics/05-lists-of-lists.md) most of all.*

The editor has `rail_fence` from [Lists of lists](../../../../../notes/02-python/01-basics/05-lists-of-lists.md), working. Write `rail_fence_decrypt(secret, rails)`, which undoes it: it takes the letters that `rail_fence` returned and the number of rails, and returns the letters in their original order. The spaces were lost in encrypting, so they don't come back. With fewer than 1 rail, it raises a `ValueError`, as `rail_fence` does.

| Call                                       | Returns             |
| ------------------------------------------ | ------------------- |
| `rail_fence_decrypt("Ptpoosayyhndwta", 3)` | `'Podstawypythona'` |
| `rail_fence_decrypt("acebdf", 2)`          | `'abcdef'`          |
| `rail_fence_decrypt("abc", 1)`             | `'abc'`             |
| `rail_fence_decrypt("abc", 0)`             | raises `ValueError` |

This is the hardest task in Basics, so here's one way to go about it, with `Ptpoosayyhndwta` on 3 rails:

1. The zigzag depends only on how many letters there are, not on what they are. 15 letters on 3 rails were written on the rails 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2. Make that list, moving a row up and down the way `rail_fence` does.
2. Count how many times each rail is in the list: rail 0 got 4 letters, rail 1 got 7 and rail 2 got 4.
3. The secret is the rails one after another, so cut it into pieces of those lengths: `Ptpo`, `osayyhn` and `dwta`.
4. Go through the list of rails again, and each time take the first letter that's left in that rail's piece: `P` from rail 0, `o` from rail 1, `d` from rail 2, `s` from rail 1, and so on.

The program under the functions encrypts a message and decrypts it again, so **Run** shows both.
