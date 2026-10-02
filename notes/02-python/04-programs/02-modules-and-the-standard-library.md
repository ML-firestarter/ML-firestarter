---
description: Import modules and use the standard library, with re, datetime, Counter and json, to read a web server's log.
---

# Modules and the standard library

A web server writes a line to its log for every request. The lines say when it came, what was asked for and how it went, and nobody wants to read thousands of them: a program should say how many there were, which hour was the busiest and which page was slowest. That takes a few tools Python already has, and this lesson is about finding them.

In this lesson's exercise, you'll write a log reader. You'll need:

- **`import`**, which brings in a module,
- `re`, to pick the pieces out of a line of text,
- `datetime`, to work with dates and times,
- `Counter`, to count things,
- `json`, to turn a result into text another program can read,
- `if __name__ == "__main__"`, which separates what a file defines from what it runs.

## Modules

A **module** is a file of Python code that others can use. `import` makes one available, and its names are used after a dot, like `math.sqrt`:

```python run
import math

print(math.sqrt(16))
print(math.pi)
print(math.floor(7.9))
```

`from` takes a few names out of a module, so they can be used on their own, and `as` gives a module or a name a shorter one:

```python run
from math import sqrt, ceil
import statistics as stats

print(sqrt(25))
print(ceil(7.1))
print(stats.mean([2, 4, 9]))
```

Python comes with a large set of modules, the **standard library**, and they need nothing to be installed: `math`, `random`, `json`, `re`, `datetime`, `collections`, `statistics` and many more. The libraries of the [PyTorch chapter](../05-pytorch/README.md), like `torch` and `numpy`, aren't in it. They're installed separately, and [the next lesson](03-python-on-your-computer.md) says how. A module that doesn't exist, or isn't installed, stops the program with a `ModuleNotFoundError`:

```python run
import tensorflow
```

`dir()` lists the names in a module, and `help()` shows what one of them does:

```python run
import math

print([name for name in dir(math) if name.startswith("c")])
help(math.ceil)
```

## Counting with Counter

Counting how many times each item appears is one of the most common jobs. [A dictionary can do it](../01-basics/02-loops-and-dictionaries.md), and `Counter` from `collections` is a dictionary made for it. It takes anything you can loop over, and `most_common()` lists the items from the most frequent:

```python run
from collections import Counter

statuses = [200, 200, 404, 200, 500, 404]
counts = Counter(statuses)
print(counts)
print(counts[200])
print(counts[301])
print(counts.most_common(2))
```

An item that was never counted has the count 0, not a `KeyError`. When two items have the same count, `most_common()` keeps the one that came first.

## Dates and times

`datetime` makes dates and times that Python can compare and do arithmetic on. `datetime.strptime()` reads text in a format, where `%Y` is the year, `%m` the month, `%d` the day, `%H` the hour, `%M` the minute and `%S` the second, and `strftime()` writes one back out:

```python run
from datetime import datetime, timedelta

moment = datetime.strptime("2024-03-05 09:12:44", "%Y-%m-%d %H:%M:%S")
print(moment)
print(moment.hour, moment.minute)
print(moment + timedelta(hours=2, minutes=30))
print(moment.strftime("%d.%m.%Y"))
```

A `timedelta` is a length of time, which you can add to a datetime or get from subtracting two of them. A time that can't exist, like 25:99:99, raises a `ValueError`, which a `try` can catch, and the exercise's damaged lines need exactly that:

```python run
from datetime import datetime

try:
    datetime.strptime("2024-03-05 25:99:99", "%Y-%m-%d %H:%M:%S")
except ValueError:
    print("not a time")
```

## Patterns with re

Text like `2024-03-05 09:12:44 GET /home 200 35ms` has a shape, and the `re` module describes shapes with **regular expressions**. A few of the symbols:

| Pattern | Matches                                 |
| ------- | --------------------------------------- |
| `\d`    | a digit                                 |
| `\S`    | any character that isn't a space        |
| `+`     | one or more of what's before it         |
| `(...)` | a group, which `groups()` gives back    |
| `a\|b`  | `a` or `b`                              |

`re.fullmatch()` checks that the whole text fits the pattern. It returns `None` when it doesn't and a match when it does, whose `groups()` are the pieces in the parentheses. Put an `r` in front of the pattern's quotes, as in `r"\d+"`, so that Python leaves the backslashes alone:

```python run
import re

line = "2024-03-05 09:12:44 GET /home 200 35ms"
match = re.fullmatch(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms", line)
print(match.groups())

print(re.fullmatch(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms", "not a log line"))
```

`\d{3}` means exactly 3 digits, and the text `35ms` is cut so that the number is a group and the `ms` isn't. The pieces are all text: turn them into numbers with `int()`.

> [!NOTE]
> `re.search()` looks for the pattern anywhere in the text, and `re.findall()` gives every match, but a pattern that has to fit a whole line is safer with `fullmatch()`: it doesn't accept a line that only starts with something right.

## Text a program can read with json

`json` turns dictionaries and lists into text, and back. It's how programs hand data to each other, and the way many APIs and files keep it. `dumps()` makes the text, and `loads()` reads it. With `sort_keys=True`, the keys come out in order, so the same data always gives the same text:

```python run
import json

summary = {"requests": 16, "slowest": "/exercises", "errors": 2}
text = json.dumps(summary, sort_keys=True)
print(text)
print(json.loads(text)["requests"])
```

JSON keeps numbers, text, `True` and `False` (written `true` and `false`), `None` (written `null`), lists and dictionaries. A `datetime` isn't among them, so a program turns it into text with `strftime()` before it goes in.

## Your own modules

A file of your own is a module too: `import helpers` runs `helpers.py` and brings in its names. A file can tell whether it's being run or imported by looking at the variable `__name__`, which is `"__main__"` only when the file is run on its own:

```python run
print(__name__)

if __name__ == "__main__":
    print("run on its own")
```

That's why the exercises have the lines at the bottom: what's under `if __name__ == "__main__":` runs when you press **Run**, and is skipped when the checks import the file to call its functions.

## Your turn

In [Log report](../../../exercises/02-python/04-programs/02-modules-and-the-standard-library/01-log-report/task.md), you'll read a web server's log: pick each line apart with `re`, turn its time into a `datetime`, find the busiest hour with `Counter`, and write the summary as `json`. Mind the damaged lines in the file.
