---
description: Catch errors with try and except, raise your own, and read a traceback, for a receipt reader that doesn't stop at the first bad line.
---

# Exceptions

A shop's till prints a receipt with one item on each line, and the prices are typed by hand, so some of the lines are wrong: a letter where a number should be, a missing price, a blank line. A program that adds up the receipt shouldn't give up at the first of them. It should add up the good lines, and say which ones were bad and why.

In this lesson's exercises, you'll write a receipt reader, and a function that reads a traceback. You'll need:

- **exceptions**, which is what Python raises when it can't go on,
- **`try` and `except`**, which catch them,
- **`else` and `finally`**, which say what happens next,
- **`raise`**, with messages that say what's wrong,
- **tracebacks**, which say where it went wrong.

## What an exception is

When Python can't carry on with a line, it **raises an exception**, an object that says what went wrong. If nothing handles it, the program stops and Python prints a **traceback**. The kinds you'll meet most often:

| Exception           | When it happens                                         |
| ------------------- | ------------------------------------------------------- |
| `ValueError`        | the right type of value, but a wrong one: `int("x")`    |
| `TypeError`         | the wrong type of value: `"a" + 1`                      |
| `ZeroDivisionError` | dividing by zero                                        |
| `IndexError`        | an index past the end of a list                         |
| `KeyError`          | a key that isn't in a dictionary                        |
| `FileNotFoundError` | opening a file that isn't there                         |

Here they all are, caught one at a time. `lambda:` makes a tiny function with no name, so that the loop can try each line of code in turn:

```python run
actions = [
    lambda: 10 / 0,
    lambda: int("x"),
    lambda: [1, 2][5],
    lambda: {"a": 1}["b"],
    lambda: "a" + 1,
    lambda: open("nothing.txt"),
]

for action in actions:
    try:
        action()
    except Exception as error:
        print(type(error).__name__, "-", error)
```

## Reading a traceback

A traceback lists the calls that led to the error, and ends with the error. Here a function gets an empty list:

```python run
def average(numbers):
    total = sum(numbers)
    return total / len(numbers)


print(average([2, 4, 9]))
print(average([]))
```

The first call works and prints 5.0, and the second stops the program with a traceback like this:

```text
Traceback (most recent call last):
  File "main.py", line 7, in <module>
    print(average([]))
          ~~~~~~~^^^^
  File "main.py", line 3, in average
    return total / len(numbers)
           ~~~~~~^~~~~~~~~~~~~~
ZeroDivisionError: division by zero
```

Read it from the bottom:

1. **The last line** is the error: its kind, a colon and its message. Here, `ZeroDivisionError: division by zero`.
2. **The `File` line above it** is where it happened: line 3, in the function `average`, with the code of that line under it. This is the line to look at first.
3. **The `File` lines above** are the calls that got there, outermost first. Line 7, in `<module>`, is the program itself, outside of any function, and it called `average`. The `~~~^^^` marks point at the part of the line that failed.

The error is in `average`, and the cause is in what it was called with, an empty list. The traceback tells you where the program stopped, and the fix may be somewhere above that.

## try and except

`try` runs some code, and if it raises an exception, `except` runs instead of stopping the program:

```python run
text = "twenty"

try:
    age = int(text)
    print("Age:", age)
except ValueError:
    print("That's not a number")

print("The program goes on")
```

The code in `try` stops at the line that raises, and the rest of the `try` is skipped. After the `except`, the program carries on. An exception of another kind isn't caught, and still stops the program, which is what you want: `except ValueError` only handles what it's written for.

`as` gives you the exception itself. `str(error)` is its message, and `type(error).__name__` its kind. Several `except` blocks can follow one `try`, and one block can take several kinds, in parentheses:

```python run
def read_age(text):
    try:
        age = int(text)
        return 100 // age
    except ValueError as error:
        return f"bad number ({error})"
    except (ZeroDivisionError, OverflowError):
        return "age can't be 0"


print(read_age("20"))
print(read_age("twenty"))
print(read_age("0"))
```

> [!WARNING]
> `except:` with nothing after it, or `except Exception:` around a lot of code, catches mistakes you didn't know about, like a typo in a name, and hides them. Catch the kinds of error you expect, around the lines that can raise them.

## else and finally

`else` runs when the `try` raised nothing, and is the place for what only makes sense after a success. `finally` runs whatever happened, an error included, which is where cleaning up goes:

```python run
def to_cents(text):
    try:
        price = float(text)
    except ValueError:
        print("bad price:", text)
        return None
    else:
        print("good price:", text)
        return round(price * 100)
    finally:
        print("done with", text)


print(to_cents("3.50"))
print(to_cents("x"))
```

`finally` runs even though both branches `return`. Keeping the `try` short, only the line that can fail, and putting the rest in `else`, means that an `except` can't catch an error from the code after it by accident.

## Raising your own

`raise` stops a function with an exception of your choice, and the message is what a reader of the traceback, or of the caller's `str(error)`, sees. A function that's given something it can't work with should say what's wrong, and what it was given:

```python run
def parse_price(text):
    if text == "":
        raise ValueError("empty price")
    try:
        return float(text)
    except ValueError:
        raise ValueError(f"bad price: {text}")


for text in ["3.50", "", "x"]:
    try:
        print(parse_price(text))
    except ValueError as error:
        print("problem:", error)
```

Raising a `ValueError` from inside the `except` replaces Python's own message about floats with one that fits your program. `raise` with nothing after it, inside an `except`, passes the error you just caught on, if you want to log something and still stop. A kind of error of your own is a class that comes from `Exception`, and the [Classes lesson](../04-programs/01-classes.md) is where those are written.

## Not stopping at the first mistake

A loop that handles each item's error itself can go through the whole list, and collect what went wrong. This is the shape of the receipt reader:

```python run
def parse_price(text):
    try:
        return float(text)
    except ValueError:
        raise ValueError(f"bad price: {text}")


prices = ["3.50", "x", "2.40", ""]
total = 0
problems = []

for number, text in enumerate(prices, start=1):
    try:
        total += parse_price(text)
    except ValueError as error:
        problems.append([number, str(error)])

print(total)
print(problems)
```

`enumerate()` counts the items of a list as it goes through them, from `start`. The total has only the good prices, and `problems` says which items were bad, by their number, and why.

## Your turn

In [Read the receipt](../../../exercises/02-python/03-errors-and-testing/01-exceptions/01-read-the-receipt/task.md), you'll parse the lines of a receipt, raising an error for each kind of mistake, and add up the good ones while collecting the bad. In [Read the traceback](../../../exercises/02-python/03-errors-and-testing/01-exceptions/02-read-the-traceback/task.md), you'll pick the kind of error, the function and the line out of a traceback's text.
