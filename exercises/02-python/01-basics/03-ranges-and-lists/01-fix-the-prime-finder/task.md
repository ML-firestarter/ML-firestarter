---
description: Find three mistakes that make a program give wrong answers without stopping it.
input: "10\n20"
---

# Fix the prime finder

A prime number is a whole number greater than 1 that divides evenly only by 1 and by itself, like 2, 3, 5, 7 and 11. This program reads two numbers and prints the primes from the first to the second, both included. With `10` and `20` in the **Input** box, it should print:

```text
10
20
11, 13, 17, 19
```

It runs without an error, but three mistakes make it give wrong answers: two in `is_prime` and one in `primes_between`. Press **Check** and read which checks fail: each shows a call, what it returned and what it should have returned, and that tells you where to look. Each mistake takes a small change to one line, so there's no need to rewrite the functions.
