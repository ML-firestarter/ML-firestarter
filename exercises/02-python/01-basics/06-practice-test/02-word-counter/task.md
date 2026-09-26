---
description: Count how often each word occurs in a text, and find the most common one.
---

# Word counter

*Draws on [Loops and dictionaries](../../../../../notes/02-python/01-basics/02-loops-and-dictionaries.md) and, for `split()`, [Reading and writing files](../../../../../notes/02-python/01-basics/04-files.md).*

Write two functions:

- `count_words(text)` returns a dictionary with each word of `text` and how many times it occurs. Capitals make no difference: `The` and `the` are the same word, which the dictionary has in small letters. The words are separated by spaces, and the texts have no punctuation.
- `most_common(text)` returns the word that occurs most often in `text`, in small letters. When several words occur equally often, it's the one of them that comes first in the text.

| Call                                     | Returns                                    |
| ---------------------------------------- | ------------------------------------------ |
| `count_words("the cat and the hat")`     | `{'the': 2, 'cat': 1, 'and': 1, 'hat': 1}` |
| `count_words("Yes yes YES")`             | `{'yes': 3}`                               |
| `most_common("The cat and the hat")`     | `'the'`                                    |
| `most_common("one two two three three")` | `'two'`                                    |
