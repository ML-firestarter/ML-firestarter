---
description: Give clues for a guess in a word game, and narrow a list of words down with them.
input: "2\nspeed G-GG-\nsweet G-GGY"
---

# Word clues

*Draws on [Loops and dictionaries](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.md), for counting with a dictionary, [Ranges and lists](../../../../notes/02-python/01-basics/03-ranges-and-lists.md), for lists and `range()`, [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md), for `read()` and `split()`, and [Lists of lists](../../../../notes/02-python/01-basics/05-lists-of-lists.md), for `"".join()` and `raise`.*

In a word game, the player tries to find a secret word. After each guess the game gives a clue for each letter of the guess: `G` if the secret has the same letter in the same place, `Y` if the letter is in the secret but in another place, and `-` if it isn't in the secret at all.

A letter of the secret can give only one clue. First the letters in the right place get their `G`, and those letters of the secret are used up. Then, from left to right, a letter in the wrong place gets a `Y` if the secret still has an unused copy of that letter, which the `Y` uses up, and a `-` if it doesn't.

For example, the secret `crane` and the guess `eerie` give `--Y-G`. The last `e` is in the right place, which uses up the only `e` in `crane`, so the other two get nothing, and the `r` is in `crane`, but in another place.

Write two functions:

- `clues(secret, guess)` returns the clues for the guess as a string with a character for each letter of the guess. When the two words aren't the same length, it raises a `ValueError`.
- `possible_words(words, guess, pattern)` returns the words in the list that would give `pattern` as the clues for `guess` if one of them were the secret, in the order they have in the list. A word that isn't as long as the guess can't be the secret, so it's left out.

| Call                                                          | Returns             |
| ------------------------------------------------------------- | ------------------- |
| `clues("crane", "crane")`                                     | `'GGGGG'`           |
| `clues("crane", "slate")`                                     | `'--G-G'`           |
| `clues("apple", "paper")`                                     | `'YYGY-'`           |
| `clues("crane", "eerie")`                                     | `'--Y-G'`           |
| `clues("crane", "cat")`                                       | raises `ValueError` |
| `possible_words(["crane", "trace", "cat"], "slate", "--G-G")` | `['crane']`         |

The program under the functions reads the list of words from `words.txt`, then a number of guesses and, for each of them, the guess and the clues it got, with a space between them. It narrows the list down guess by guess, and prints the words that are left, or `No word fits` if none is. The input above, `speed` with `G-GG-` and then `sweet` with `G-GGY`, leaves one word:

```text
steel
```

This is the hardest task in the workbook, so here's one way to go about `clues`:

1. Start with a list that has a `"-"` for each letter of the guess. You'll change the places that get a `G` or a `Y`.
2. Go through the places once. Where the two words have the same letter, change that place in the list to `"G"`. Where they don't, the secret's letter there is still unused, so count it in a dictionary, the way the vowels are counted in [Loops and dictionaries](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.md).
3. Go through the places again. A place that didn't get a `G` becomes a `"Y"` when the dictionary has its letter with a count above 0, and then that count goes down by 1.
4. `"".join()` turns the list into the string to return.
