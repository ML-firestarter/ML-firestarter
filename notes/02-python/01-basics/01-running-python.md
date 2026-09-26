---
description: Printing text and numbers, doing arithmetic, and reading Python's error messages.
---

# Running Python

A Python program is a text file of instructions. Python carries them out one line at a time, from the top down. Here's a whole program; press **Run** to run it:

```python run
print("Hello!")
```

`print` shows what's between its parentheses. The quotes mark `Hello!` as text, which Python calls a **string**. It prints the text exactly as written, without the quotes.

> [!TIP]
> Every example in this lesson runs in your browser. Press **Edit** to change one and **Run** it again, and **Undo changes** to go back to the lesson's version. Trying things out is the quickest way to learn.

## Printing

Each `print()` prints a line of its own, so a program with three of them prints three lines:

```python run
print("Python runs")
print("one line")
print("at a time.")
```

`print()` can also take several values, separated by commas. It prints them all on one line, with a space between each two:

```python run
print("A week has", 7, "days.")
```

The `7` has no quotes, because it's a number, not text. You can do arithmetic with numbers.

## Arithmetic

Python makes a good calculator:

```python run
print(2 + 3)
print(10 - 4)
print(6 * 7)
print(7 / 2)
```

| Operator | Meaning                 | Example   | Result |
| -------- | ----------------------- | --------- | ------ |
| `+`      | addition                | `2 + 3`   | `5`    |
| `-`      | subtraction             | `10 - 4`  | `6`    |
| `*`      | multiplication          | `6 * 7`   | `42`   |
| `/`      | division                | `7 / 2`   | `3.5`  |
| `//`     | division, rounded down  | `7 // 2`  | `3`    |
| `%`      | remainder of a division | `7 % 2`   | `1`    |
| `**`     | power                   | `2 ** 10` | `1024` |

`/` always gives a number with a decimal point, even when the division comes out even: `6 / 3` is `2.0`. Python calls such numbers **floats**, and whole numbers like `2` **ints**.

`//` and `%` work as a pair: `//` says how many whole times one number goes into another, and `%` what's left over. 100 minutes are 1 hour and 40 minutes:

```python run
print(100 // 60, "h", 100 % 60, "min")
```

The usual order applies: `**` comes first, then `*`, `/`, `//` and `%`, and `+` and `-` last. Parentheses change the order:

```python run
print(2 + 3 * 4)
print((2 + 3) * 4)
```

## Text or code?

Quotes decide whether Python works something out or prints it as it is:

```python run
print("2 + 3")
print(2 + 3)
```

The first line prints the text `2 + 3`, and the second the result, `5`. Together they can show a sum and its result:

```python run
print("2 + 3 =", 2 + 3)
```

A string can be in double quotes, `"like this"`, or single quotes, `'like this'`. Both work the same, as long as the string starts and ends with the same kind. Text with an apostrophe goes in double quotes, like `"It's"`, since in `'It's'` the apostrophe would end the string.

## Comments

Python skips everything from a `#` to the end of its line. That's a **comment**, a note for whoever reads the code:

```python run
# How many seconds are in an hour?
print(60 * 60)  # 60 minutes of 60 seconds
```

A `#` inside quotes is part of the text, not a comment: `print("#1")` prints `#1`.

## When something goes wrong

Python does exactly what the code says, and when it can't, it stops and prints an **error message**. Run this:

```python run
print("Hello"
```

The parenthesis is never closed, and Python says so: `'(' was never closed`. That's a `SyntaxError`, which means the code isn't valid Python. Python then runs none of it, not even the lines that are fine.

Python also tells capital letters apart, so `print` and `Print` are two different names. Run this:

```python run
print("First line")
Print("Second line")
print("Third line")
```

This time the first line runs, and the program stops at the second:

```text
Traceback (most recent call last):
  File "main.py", line 2, in <module>
    Print("Second line")
    ^^^^^
NameError: name 'Print' is not defined. Did you mean: 'print'?
```

Python knows nothing called `Print`, so that's a `NameError`, and the third line never runs. Read error messages from the bottom up:

1. The **last line** says what went wrong: the kind of error, then the details. Here Python even suggests the fix.
2. **Above it** is where: the line number, the line itself, and `^` marks under the part that failed.

> [!TIP]
> Python reports one mistake at a time. When a program has several, fix the one it points at and run it again to find the next.

## Check yourself

<details>
<summary>What does <code>print("6 * 7")</code> print, and what does <code>print(6 * 7)</code> print?</summary>

The first prints the text `6 * 7`, because it's in quotes. The second works it out and prints `42`.

</details>

<details>
<summary>What are <code>17 // 5</code> and <code>17 % 5</code>?</summary>

`17 // 5` is `3`, because 5 goes into 17 three whole times, and `17 % 5` is `2`, what's left over: 17 = 3 × 5 + 2.

</details>

<details>
<summary>Why does <code>print(8 / 2)</code> print <code>4.0</code>, not <code>4</code>?</summary>

`/` always gives a float, a number with a decimal point, even when the division comes out even. `8 // 2` gives `4`.

</details>

<details>
<summary><code>print(Hello)</code> stops with <code>NameError: name 'Hello' is not defined</code>. What's wrong?</summary>

`Hello` has no quotes, so Python takes it for the name of something rather than text, and nothing is called `Hello`. With quotes, `print("Hello")` prints the text.

</details>
