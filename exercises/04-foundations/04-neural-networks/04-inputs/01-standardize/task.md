---
description: Work out the average and the spread of a list of numbers, and standardize new orders with the training orders' average and spread.
---

# Standardize the inputs

Finish three functions, for standardizing as in [Standardizing the inputs](../../../../../notes/04-foundations/04-neural-networks/04-inputs.md#standardizing-the-inputs):

- `average(values)` returns the average of the numbers in the list `values`.
- `spread(values)` returns their spread, the standard deviation: the square root of the average of their squared distances from their average.
- `standardize(values, training)` returns a new list, with each number in `values` standardized with the average and the spread of `training`: minus the average, divided by the spread.

`TRAINING_KMS` are the eight orders that the network in [Training a network](../../../../../notes/04-foundations/04-neural-networks/03-training.md) was trained on, and `NEW_KMS` three new orders.

| Call                                          | Returns                          |
| --------------------------------------------- | -------------------------------- |
| `average(TRAINING_KMS)`                       | `7.25`                           |
| `spread([2, 4, 6, 8, 10, 12, 14])`            | `4.0`                            |
| `spread(TRAINING_KMS)`                        | about `4.265`                    |
| `standardize([14], [2, 4, 6, 8, 10, 12, 14])` | `[1.5]`                          |
| `standardize(NEW_KMS, TRAINING_KMS)`          | about `[-0.997, -0.762, -0.528]` |

The table rounds to 3 decimal places, but the checks don't. The training orders' average, 7.25 km, isn't far from the 7 km that [Measuring from the middle](../../../../../notes/04-foundations/04-neural-networks/03-training.md#measuring-from-the-middle) took as their middle. When you run the code, its last line prints the average and the spread of the standardized training orders, which should be 0 and 1.

If `spread(TRAINING_KMS)` gives about `4.559`, it divides by 7, one less than the number of values, as `statistics.stdev` does. The spread from the lesson divides by the number of values, 8.

If `standardize(NEW_KMS, TRAINING_KMS)` gives about `[-1.225, 0.0, 1.225]`, or `standardize([5], TRAINING_KMS)` raises a `ZeroDivisionError`, `standardize` works out the average and the spread of `values`, instead of `training`. A single order is its own average, so its spread is 0, as in [New orders](../../../../../notes/04-foundations/04-neural-networks/04-inputs.md#new-orders).
