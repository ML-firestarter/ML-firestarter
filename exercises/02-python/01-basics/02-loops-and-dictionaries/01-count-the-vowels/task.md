---
description: Count each vowel in a sentence, letter by letter, in a dictionary.
input: Monty Python
---

# Count the vowels

Finish `count_vowels(text)`. It returns a dictionary that says how many times each vowel occurs in `text`, whether it's a capital or not. The vowels here are a, e, i, o, u and y, as in Polish, and each of them is in the dictionary, with 0 for those that don't occur.

| Call                           | Returns                                            |
| ------------------------------ | -------------------------------------------------- |
| `count_vowels("Abracadabra")`  | `{'a': 5, 'e': 0, 'i': 0, 'o': 0, 'u': 0, 'y': 0}` |
| `count_vowels("Monty Python")` | `{'a': 0, 'e': 0, 'i': 0, 'o': 2, 'u': 0, 'y': 2}` |

Then finish the program under the function. It reads a line from the **Input** box, and it should print each vowel that occurs in it, with its count, one vowel to a line. It leaves out the vowels that don't occur, and it keeps the order a, e, i, o, u, y, whatever order they come in in the text. With `Monty Python`, it prints:

```text
Monty Python
o: 2
y: 2
```

The first line is what `input()` read.
