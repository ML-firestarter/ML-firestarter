---
description: Work out the slopes of the log loss for both parameters, and take one step against them.
---

# One training step

Finish two functions. As before, `waits` has the wait of each order, and `cancelled` its label, 1 or 0, in the same order.

- `slopes(waits, cancelled, w, b)` returns the list `[slope_w, slope_b]`: the slope of the log loss for `w` and the one for `b`, at the rule with those parameters. The loop already works out each order's probability `p`, but doesn't add anything to the slopes.
- `step(waits, cancelled, w, b, learning_rate)` takes one step of gradient descent from `w` and `b`, and returns the new parameters as the list `[w, b]`.

Each order adds to the slopes as in [A formula for the slope](../../../../../notes/04-foundations/03-logistic-regression/03-training.md#a-formula-for-the-slope): its error, `p` minus its label, times its wait, to the slope for `w`, and the error alone to the slope for `b`, both divided by the number of orders. `step` can call `slopes`.

| Call                                                            | Returns               |
| --------------------------------------------------------------- | --------------------- |
| `slopes([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0, 0)`       | about `[-1.333, 0.0]` |
| `slopes([2, 4, 6, 8], [1, 0, 0, 1], 0, 0)`                      | `[0.0, 0.0]`          |
| `step([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0, 0, 0.1)`    | about `[0.133, 0.0]`  |
| `step([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.5, -4, 0.1)` | about `[0.477, -4.0]` |

The table rounds the numbers to 3 decimal places, but the checks don't. The last call starts from the rule from the first lesson, and the step makes it flatter, towards the best rule for these six orders.

If `step` moves the parameters the wrong way, check the sign: a step takes the slope away, it doesn't add it. If the slopes come out twice as big as in the table, they're worked out like the ones for the MSE, but the slopes of the log loss have no 2.
