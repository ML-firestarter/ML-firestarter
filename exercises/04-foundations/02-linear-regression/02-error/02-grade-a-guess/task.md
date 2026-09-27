---
description: Score any line on any receipts, and the baseline to compare it with.
---

# Grade a guess

Write two functions:

- `loss(kms, fares, w, b)` returns the mean squared error of the line with the price per km `w` and the starting fee `b` on the receipts: `kms` has the distance of each ride, and `fares` its fare, in the same order.
- `baseline(fares)` returns the mean squared error of the baseline, which predicts the average fare for every ride.

| Call                                          | Returns |
| --------------------------------------------- | ------- |
| `loss([2, 4, 6, 8], [15, 23, 29, 33], 3, 8)`  | `5.0`   |
| `loss([2, 4, 6, 8], [15, 23, 29, 33], 3, 10)` | `1.0`   |
| `loss([1, 3], [9, 15], 2.5, 4)`               | `9.25`  |
| `baseline([15, 23, 29, 33])`                  | `46.0`  |
| `baseline([7, 7, 7])`                         | `0.0`   |

If `loss` gives `20` where it should give `5.0`, it adds up the squared errors but doesn't divide by the number of rides.
