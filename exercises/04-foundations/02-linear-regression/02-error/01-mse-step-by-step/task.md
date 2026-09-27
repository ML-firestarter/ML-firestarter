---
description: Write the mean squared error as small functions, one for each step.
---

# MSE step by step

The mean squared error takes five steps: predict, subtract, square, add up and divide. Here the predictions are already made, and the other steps each get a small function of their own, so that when a check fails, its function is the step to fix. `errors` is done. Finish the other three:

- `errors(predictions, fares)` returns the list of the errors: each prediction minus its fare.
- `squares(numbers)` returns the list of the numbers, each one squared.
- `mean(numbers)` returns the average of the numbers: their sum divided by how many there are.
- `mse(predictions, fares)` returns the mean squared error of the predictions, using the three functions above.

`sum()` adds up the numbers in a list: `sum([1, 9, 9, 1])` is `20`.

| Call                                         | Returns            |
| -------------------------------------------- | ------------------ |
| `errors([14, 20, 26, 32], [15, 23, 29, 33])` | `[-1, -3, -3, -1]` |
| `squares([-1, -3, -3, -1])`                  | `[1, 9, 9, 1]`     |
| `mean([1, 9, 9, 1])`                         | `5.0`              |
| `mse([14, 20, 26, 32], [15, 23, 29, 33])`    | `5.0`              |
| `mse([25, 25, 25, 25], [15, 23, 29, 33])`    | `46.0`             |
