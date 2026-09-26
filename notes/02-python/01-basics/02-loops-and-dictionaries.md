---
description: Strings, for loops and dictionaries, for a program that counts the vowels in a sentence.
---

# Loops and dictionaries

In this lesson's exercise, you'll count the vowels in a sentence: how many a's it has, how many e's, and so on. By hand, you'd go through the sentence one letter at a time and keep a tally for each vowel. Python does it the same way, with:

- a **for loop**, which runs the same code for each letter of a text, or each item of a list,
- a **dictionary**, which keeps a value, like a tally, under a key, like a letter.

## Text, letter by letter

A string is a sequence of characters, in order: letters, digits, spaces and punctuation. `len()` gives its length, and square brackets pick one of its characters by its position, called its **index**. Indexes count from 0:

```python run
word = "Python"
print(len(word))
print(word[0])
print(word[5])
```

`in` checks whether a string is part of another one, down to a single letter:

```python run
print("y" in "Python")
print("a" in "Python")
print("tho" in "Python")
```

Strings have **methods**: functions that belong to them, which you call with a dot after the string. `lower()` gives back the text in small letters, and `upper()` in capitals:

```python run
text = "Monty Python"
print(text.lower())
print(text.upper())
print(text)
```

The last line shows that `text` itself hasn't changed. A string never changes: methods like `lower()` give back a new one. To keep it, store it in a variable, even the same one: `text = text.lower()`.

## The for loop

A `for` loop runs its block once for each item of a sequence, with a variable set to that item. The items of a string are its characters:

```python run
for letter in "cat":
    print(letter)
print("Done.")
```

As with `if`, the line with `for` ends with a colon, and the block under it is indented. The first time the block runs, `letter` is `"c"`, then `"a"`, and then `"t"`. After the last one, the program goes on after the loop.

A loop often builds up a result as it goes. To count something, start a variable at 0 and add 1 to it each time you find one:

```python run
count = 0
for letter in "banana":
    if letter == "a":
        count += 1
print(count)
```

The `if` is inside the loop, so it's indented once, and the line under it twice. The loop checks every letter, and `count` goes up for each `a`. `count += 1` is short for `count = count + 1`, and `-=` and `*=` work the same way.

## Dictionaries

To count every vowel, you'd need a variable for each of them. A **dictionary** keeps them all together. It holds pairs of a **key** and a **value**, and finds each value by its key, the way a paper dictionary finds a word's meaning by the word. It's written in curly brackets, with a colon between each key and its value:

```python run
ages = {"Ada": 36, "Alan": 41}
print(ages)
print(ages["Ada"])
```

Square brackets with a key read its value, and `=` changes the value, or adds the key if the dictionary doesn't have it yet:

```python run
ages = {"Ada": 36, "Alan": 41}
ages["Ada"] = 37
ages["Grace"] = 85
print(ages)
print(len(ages))
```

Reading a key that isn't there stops the program with a `KeyError`, so check first. `in` checks whether a dictionary has a key:

```python run
ages = {"Ada": 36, "Alan": 41}
print("Ada" in ages)
print("Linus" in ages)
print(ages["Linus"])
```

A value in a dictionary goes up with `+=`, like any variable:

```python run
counts = {"a": 0, "b": 0}
counts["a"] += 1
counts["a"] += 1
print(counts)
```

Put that in a loop, and you can count every letter of a word. The first time a letter comes up, it isn't in the dictionary yet, so the loop adds it with a count of 1. After that, its count goes up:

```python run
counts = {}
for letter in "banana":
    if letter in counts:
        counts[letter] += 1
    else:
        counts[letter] = 1
print(counts)
```

## Going through a dictionary

A `for` loop over a dictionary goes through its keys. `items()` gives the keys together with their values, in pairs, and the loop can take each pair apart into two variables:

```python run
ages = {"Ada": 36, "Alan": 41, "Grace": 85}
for name in ages:
    print(name)
for name, age in ages.items():
    print(name, age)
```

The keys come in the order they were added to the dictionary. That's not alphabetical order, or any other, unless you added them that way.

## f-strings

An **f-string** has an `f` before its opening quote. It puts the values of the expressions in curly brackets into its text:

```python run
name = "Ada"
age = 36
print(f"{name} is {age}")
print(f"{name}: {age + 1} next year")
```

That makes it easy to print results in a set format, like `a: 3`:

```python run
counts = {"b": 1, "a": 3, "n": 2}
for letter, count in counts.items():
    print(f"{letter}: {count}")
```

## Your turn

In [Count the vowels](../../../exercises/02-python/01-basics/02-loops-and-dictionaries/01-count-the-vowels/task.md), you'll write a function that counts each vowel of a text in a dictionary, capital letters included, and the loop that prints the counts, in the order of the vowels in the alphabet.
