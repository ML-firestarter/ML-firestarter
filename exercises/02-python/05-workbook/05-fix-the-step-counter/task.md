---
description: Find three mistakes that make a step counter give wrong answers without stopping it.
input: "8200 10450 3000 12000 7600"
---

# Fix the step counter

*Draws on [Conditions and functions](../../../../notes/02-python/01-basics/01-conditions-and-functions.md) and [Ranges and lists](../../../../notes/02-python/01-basics/03-ranges-and-lists.md), most of all its section on bugs that don't stop a program.*

This program reads the number of steps someone walked on each day, separated by spaces, and sums them up. It gives their total and their average per day, tells which level the average earns, and counts the days that reached the goal of 10000 steps. A level is `gold` from 10000 steps, `silver` from 7000, `bronze` from 4000, and `none` below that. With `8200 10450 3000 12000 7600` in the **Input** box, it should print:

```text
8200 10450 3000 12000 7600
Total: 41250
Average: 8250
Level: silver
Days with 10000 steps: 2
```

It runs without an error, but three mistakes make it give wrong answers, one in each of `total_steps`, `level` and `goal_days`. Press **Check** and read which checks fail: each shows a call, what it returned and what it should have returned, and that tells you where to look. Each mistake takes a small change, so there's no need to rewrite the functions.
