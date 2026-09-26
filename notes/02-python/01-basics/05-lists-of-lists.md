---
description: Indexes, slices, lists of lists and errors of your own, for the rail fence cipher.
---

# Lists of lists

The **rail fence cipher** is an old way of hiding a message. You write its letters in a zigzag over a few rows, called rails, and then read the rails off one after another. Here's "Podstawy pythona", which is Polish for "Python basics", on 3 rails, without its space:

```text
P . . . t . . . p . . . o . .
. o . s . a . y . y . h . n .
. . d . . . w . . . t . . . a
```

Rail by rail, it reads `Ptpo`, `osayyhn` and `dwta`, so the secret message is `Ptpoosayyhndwta`. Only someone who knows there were 3 rails can easily undo it.

In this lesson's exercise, you'll write the cipher in Python. Each rail is a list of letters, so the whole fence is a list of lists, and a row number goes down and up across it. You'll need:

- **indexes** and **slices**, which pick items from lists and strings,
- **lists of lists**,
- a variable that goes back and forth,
- `raise`, which stops a function that's given an argument it can't work with.

## Indexes and slices

An item's index is its position in a list, counted from 0. Negative indexes count from the end: `-1` is the last item, and `-2` the one before it. An index with `=` changes the item:

```python run
letters = ["a", "b", "c", "d", "e"]
print(letters[0])
print(letters[-1])
letters[1] = "B"
print(letters)
```

An index past the end stops the program with an `IndexError`: a list of 5 items has the indexes 0 to 4.

```python run
letters = ["a", "b", "c", "d", "e"]
print(letters[5])
```

A **slice** picks several items at once: `[start:stop]` gives those from `start` up to `stop`, but not including it, just like `range()`. Leave out `start` to begin at the beginning, and `stop` to go on to the end. Slices work on strings too:

```python run
letters = ["a", "b", "c", "d", "e"]
print(letters[1:3])
print(letters[:2])
print(letters[2:])
print("Python"[0:2])
```

`list()` turns a string into a list of its characters, and `pop(0)` takes the first item out of a list and gives it back:

```python run
letters = list("abc")
print(letters)
first = letters.pop(0)
print(first)
print(letters)
```

## Lists of lists

A list can hold any values, and that includes other lists. A list of lists works like a table: the first index picks a row, and the second an item in that row:

```python run
grid = [["a", "b"], ["c", "d"], ["e", "f"]]
print(grid[1])
print(grid[1][0])
grid[2].append("g")
print(grid)
```

To make a list with an empty list for each rail, use a list comprehension:

```python run
rails = [[] for _ in range(3)]
print(rails)
rails[0].append("x")
print(rails)
```

`_` is a variable name like any other. By custom, it's the name for a variable that isn't used: here, the loop only counts to 3.

`[[]] * 3` looks as if it did the same, but it doesn't. `*` repeats a list's items, and the item here is one empty list, so the result holds that same list three times. Adding to one of them adds to all three:

```python run
rails = [[]] * 3
rails[0].append("x")
print(rails)
```

## Going back and forth

The zigzag needs a row number that goes 0, 1, 2, back up through 1 to 0, and down again. Keep the row in one variable, and the direction in another, `step`: 1 for going down and -1 for going up. After each letter, the row moves by `step`, and `step` turns around at the top and bottom rails:

```python run
rails = 3
row = 0
step = 1
for letter in "abcdefghi":
    print(letter, row)
    if row == 0:
        step = 1
    elif row == rails - 1:
        step = -1
    row += step
```

The bottom rail is `rails - 1`, as the rails are counted from 0. Change `rails` to 2 or 4 and see how the zigzag changes.

## Replacing and joining

`replace()` gives back a string in which every occurrence of one piece of text is replaced by another. Replacing it with `""`, an empty string, removes it:

```python run
text = "Podstawy pythona"
print(text.replace(" ", ""))
print(text.replace("o", "0"))
```

`"".join()`, with an empty string before the dot, joins a list of strings with nothing between them:

```python run
rail = ["P", "t", "p", "o"]
print("".join(rail))
```

`+` joins two strings too, so a loop can build a string piece by piece, starting from an empty one:

```python run
word = ""
for piece in ["Py", "th", "on"]:
    word += piece
print(word)
```

## Raising errors

Some arguments make no sense for a function: a rail fence can't have 0 rails. Rather than return a wrong answer, a function can stop with an error, the way Python's own functions do, with `raise`:

```python run
def average(numbers):
    if len(numbers) == 0:
        raise ValueError("no numbers to average")
    return sum(numbers) / len(numbers)


print(average([2, 4, 9]))
print(average([]))
```

`sum()` adds up the numbers in a list. `ValueError` is the kind of error for an argument of the right type with a wrong value, like the text in `int("twenty")`. The message in the parentheses says what went wrong, and shows on the last line of the error. In the exercises, a check like `rail_fence('abc', 0)` that expects a `ValueError` passes when the function raises one.

## Your turn

In [Rail fence cipher](../../../exercises/02-python/01-basics/05-lists-of-lists/01-rail-fence-cipher/task.md), you'll put it all together: leave out the spaces, lay the letters out on the rails in a zigzag, and read them off rail by rail. Mind the fence with a single rail, and the one with no rails at all.
