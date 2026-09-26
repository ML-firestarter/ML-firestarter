---
description: Decide whether someone is an adult from the age they type in.
input: 20
---

# Old enough?

Someone is an adult from their 18th birthday. Finish the function `is_adult(age)`: it takes an age in whole years and returns `True` when it's 18 or more, and `False` otherwise.

| Call           | Returns |
| -------------- | ------- |
| `is_adult(18)` | `True`  |
| `is_adult(17)` | `False` |
| `is_adult(42)` | `True`  |

Under the function, the program reads an age from the **Input** box and prints what `is_adult` says about it. The program has a mistake of its own, which shows once `is_adult` compares the age with 18: `input()` gives text, and Python can't compare text with a number. Fix it, so that with `20` in the **Input** box the program prints:

```text
20
True
```

The first line is the age you typed in: the page shows each line that `input()` reads, as a terminal would.
