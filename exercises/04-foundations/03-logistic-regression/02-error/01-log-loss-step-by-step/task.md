---
description: Write the log loss as small functions, one for each step.
---

# Log loss step by step

The log loss takes five steps: predict, pick the probability of what happened, take its logarithm and flip the sign, add up and divide. Here the predictions are already made, and the other steps each get a small function of their own, so that when a check fails, its function is the step to fix. `given` is done. Finish the other three:

- `given(ps, ys)` returns the list of the probabilities the rule gave to what happened: for each order, its probability `p` if its label is 1, and `1 - p` if it's 0.
- `penalties(qs)` returns the list of the penalties, one for each probability `q`: minus its natural logarithm. `math.log(q)` works out the natural logarithm of `q`.
- `mean(numbers)` returns the average of the numbers: their sum divided by how many there are.
- `log_loss(ps, ys)` returns the log loss of the predictions `ps` for the labels `ys`, using the three functions above.

| Call                                  | Returns                |
| ------------------------------------- | ---------------------- |
| `given([0.75, 0.75, 0.5], [1, 0, 1])` | `[0.75, 0.25, 0.5]`    |
| `penalties([0.5, 0.25])`              | about `[0.693, 1.386]` |
| `mean([1, 2, 6])`                     | `3.0`                  |
| `log_loss([0.5, 0.5], [1, 0])`        | about `0.693`          |
| `log_loss([0.9, 0.9], [1, 0])`        | about `1.204`          |

The table rounds some of the numbers to 3 decimal places, but the checks don't, so don't round them in the functions.

If the penalties come out negative, they're missing their minus: the logarithm of a probability is never more than 0.
