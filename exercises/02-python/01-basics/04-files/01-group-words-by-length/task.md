---
description: Read words from a file, group them by length and write the groups to another file.
---

# Group words by length

The file `words.txt` has a word on each line: Python words you've met by now, like `print`, `if` and `return`. Finish two functions.

`group_by_length(path)` reads the file at `path` and returns a dictionary with a key for each length of word. The key's value is the list of the words of that length, in their order in the file. The keys go from the shortest length to the longest, whatever order the file has them in:

```python
{2: ['if', 'in'], 3: ['for', 'def', 'len'], 4: ['else', 'list', 'dict', 'open', 'with'], ...}
```

`write_groups(groups, path)` takes a dictionary like that and writes it to the file at `path`, one line for each length: the length, a colon, and the words, separated by commas.

The program under the functions groups the words of `words.txt`, writes them to `result.txt` and prints that file, so **Run** shows what your functions wrote. Once they work, it prints:

```text
2: if, in
3: for, def, len
4: else, list, dict, open, with
5: print, input, range
6: return
```
