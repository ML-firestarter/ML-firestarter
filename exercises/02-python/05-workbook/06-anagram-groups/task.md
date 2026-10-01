---
description: Find the words in a file that are made of the same letters, like "evil" and "live".
---

# Anagram groups

*Draws on [Loops and dictionaries](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.md), [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md), for dictionaries of lists and `sorted()`, and [Lists of lists](../../../../notes/02-python/01-basics/05-lists-of-lists.md), for `"".join()`.*

Two words are anagrams when one is made by rearranging the letters of the other, like `evil` and `live`. Put the letters of both in alphabetical order, and you get the same letters, `eilv`, whichever way the word started. That makes the sorted letters a good key for grouping anagrams.

Write three functions:

- `signature(word)` returns the letters of `word` in alphabetical order, in small letters: `signature("Evil")` is `'eilv'`.
- `group_anagrams(words)` takes a list of words and returns a dictionary with the groups of anagrams among them. Each group is a list under its signature, with the words in the order they have in `words`, written as they were given. A word that has no anagram in the list doesn't form a group.
- `read_words(path)` returns the words of the file at `path` as a list. The file has a word on each line, and a blank line here and there, which doesn't count.

| Call                                                | Returns                              |
| --------------------------------------------------- | ------------------------------------ |
| `signature("Evil")`                                 | `'eilv'`                             |
| `group_anagrams(["evil", "tulip", "vile", "live"])` | `{'eilv': ['evil', 'vile', 'live']}` |
| `group_anagrams(["tulip", "kayak"])`                | `{}`                                 |

The program under the functions reads `words.txt` and prints a line for each group: its signature, a colon and its words. The groups come in the alphabetical order of their signatures. Once your functions work, the first lines of the output are:

```text
aegln: angle, glean, angel
aelst: stale, slate, least, steal
below: below, elbow, bowel
```

> [!TIP]
> `sorted()` puts the letters of a string in order too: `sorted("evil")` is `['e', 'i', 'l', 'v']`. `"".join()` of that list makes a string again.
