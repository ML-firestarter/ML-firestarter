---
description: Writing and reading files, dictionaries of lists and sorting, for a program that groups words by length.
---

# Reading and writing files

Everything a program keeps in its variables is gone when it ends. To keep data for later, or to work on data that someone else made, programs read and write **files**. In this lesson's exercise, you'll read a list of words from a file, group the words by their length, and write the groups to a new file. You'll need:

- `open()` and `with`, which read and write files,
- `split()`, which cuts a line into words,
- a **dictionary of lists**, which groups values,
- `sorted()`, which puts them in order.

Each example in this lesson runs in an empty folder of its own, so the examples write a file before they read it.

## Writing a file

`open()` opens a file and gives back an object to work on it with. Its first argument is the file's name, and the second says what you're going to do with it: `"w"` for writing. The file's `write()` method then writes text into it:

```python run
with open("shopping.txt", "w") as file:
    file.write("apples\n")
    file.write("bread\n")
    file.write("milk\n")
print("Saved.")
```

`"w"` creates the file, or empties it if it's there already, so use it with care. Unlike `print()`, `write()` doesn't end the line on its own: `"\n"`, the **newline** character, does that.

`with` keeps the file open for the block under it, and closes it when the block ends, even if an error stops the program. A file that's closed has everything written to it saved.

## Reading a file

Without a second argument, `open()` opens the file for reading. A `for` loop over the file goes through its lines:

```python run
with open("shopping.txt", "w") as file:
    file.write("apples\nbread\nmilk\n")

with open("shopping.txt") as file:
    for line in file:
        print(line)
```

Each line keeps the `"\n"` at its end, and `print()` adds a newline of its own, so blank lines show up between them. `strip()` gives back the text without the spaces and newlines at its ends:

```python run
with open("shopping.txt", "w") as file:
    file.write("apples\nbread\nmilk\n")

with open("shopping.txt") as file:
    for line in file:
        item = line.strip()
        print(item, len(item))
```

`read()` reads the whole file into one string instead:

```python run
with open("shopping.txt", "w") as file:
    file.write("apples\nbread\nmilk\n")

with open("shopping.txt") as file:
    print(file.read())
```

Opening a file that doesn't exist for reading stops the program with a `FileNotFoundError`:

```python run
with open("no-such-file.txt") as file:
    print(file.read())
```

## Splitting lines into words

A line often holds several values, like a name and a number. `split()` cuts a string at its spaces, and gives back a list of the pieces:

```python run
line = "Ada 36\n"
print(line.split())
print("one  two   three".split())
```

The newline at the end goes, and so do spaces that repeat. When you know how many pieces there are, you can put them straight into variables, the way `for name, age in ages.items()` takes pairs apart:

```python run
name, age = "Ada 36".split()
print(name)
print(int(age) + 1)
```

The pieces are strings, so a number among them needs `int()`.

## Dictionaries of lists

A dictionary's values can be lists. That's how values are sorted into groups: the key names a group, and its list holds the values in that group. Here, fruits are grouped by their first letter:

```python run
groups = {}
for fruit in ["apple", "banana", "avocado", "blueberry", "cherry"]:
    first = fruit[0]
    if first not in groups:
        groups[first] = []
    groups[first].append(fruit)
print(groups)
```

The first time a letter comes up, it isn't a key yet, so the loop gives it an empty list. After that `if`, the letter has a list either way, so `groups[first].append()` adds the fruit to it.

## Sorting

`sorted()` gives back a new list with the items of a list, or of any other sequence, in order: numbers from the smallest, and strings in alphabetical order.

```python run
print(sorted([5, 2, 9, 1]))
print(sorted(["pear", "apple", "fig"]))
```

A dictionary keeps its keys in the order they were added. `sorted()` of a dictionary gives its keys in order, which is enough to go through the dictionary in that order:

```python run
counts = {"pear": 3, "apple": 5, "fig": 1}
print(sorted(counts))
for fruit in sorted(counts):
    print(f"{fruit}: {counts[fruit]}")
```

To get a whole new dictionary with its keys in order, sort the pairs that `items()` gives, which puts them in the order of their keys, and turn them back into a dictionary with `dict()`:

```python run
counts = {"pear": 3, "apple": 5, "fig": 1}
print(dict(sorted(counts.items())))
```

## Your turn

In [Group words by length](../../../exercises/02-python/01-basics/04-files/01-group-words-by-length/task.md), a file has a word on each line. You'll group the words by their length in a dictionary of lists, from the shortest length to the longest, and write each group to another file, as a line like `2: if, in`.
