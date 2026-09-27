---
description: Score any rule on any orders, with accuracy and with the log loss, and work out the baseline's log loss.
---

# Grade a classifier

Write three functions. In each of them, `waits` has the wait of each order, and `cancelled` its label, 1 if it was cancelled and 0 if it wasn't, in the same order.

- `accuracy(waits, cancelled, w, b)` returns the fraction of the orders that the rule with the weight `w` and the bias `b` gets right, with a threshold of 0.5.
- `loss(waits, cancelled, w, b)` returns the log loss of the rule on the orders.
- `baseline(cancelled)` returns the log loss of the baseline, which gives every order the same probability of a cancellation: the fraction of the orders that were cancelled.

| Call                                                            | Returns       |
| --------------------------------------------------------------- | ------------- |
| `accuracy([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.5, -4)` | about `0.667` |
| `loss([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.5, -4)`     | about `0.496` |
| `loss([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 1, -8)`       | about `0.716` |
| `baseline([0, 0, 1, 0, 1, 1])`                                 | about `0.693` |
| `baseline([0, 1, 1, 1])`                                       | about `0.562` |

The table rounds the numbers to 3 decimal places, but the checks don't. In every check, some of the orders were cancelled and some weren't, so the baseline's probability is never 0 or 1.

If `accuracy` gives `4` where it should give about `0.667`, it counts the right decisions, but doesn't divide by the number of orders.
