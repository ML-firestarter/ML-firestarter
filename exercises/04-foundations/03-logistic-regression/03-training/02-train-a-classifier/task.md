---
description: Train a logistic regression on any orders with gradient descent.
---

# Train a classifier

Write `train(waits, cancelled, learning_rate, steps)`, which trains a rule on the orders with gradient descent: it starts from `w = 0` and `b = 0`, takes `steps` steps with the learning rate `learning_rate`, and returns the parameters it ends with as the list `[w, b]`. As before, `waits` has the wait of each order, and `cancelled` its label, 1 or 0, in the same order.

| Call                                                          | Returns               |
| ------------------------------------------------------------- | --------------------- |
| `train([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.1, 1)`    | about `[0.133, 0.0]`  |
| `train([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.1, 0)`    | `[0, 0]`              |
| `train([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.1, 5000)` | about `[0.37, -2.93]` |
| `train([2, 4, 6, 10, 12, 14], [1, 1, 0, 1, 0, 0], 0.1, 5000)` | about `[-0.37, 2.93]` |

After many steps, the parameters are very close to the best ones, but not quite there, so the checks round them to 2 decimal places first. In the last call, every label is flipped, and so are the signs of the best parameters.

If one step gives `[0.133, -0.023]`, the slope for `b` was worked out with the new `w`. Work out both slopes first, and only then change the parameters.
