---
description: Train a line on any receipts with gradient descent.
---

# Train it

Write `train(kms, fares, learning_rate, steps)`, which trains a line on the receipts with gradient descent: it starts from `w = 0` and `b = 0`, takes `steps` steps with the learning rate `learning_rate`, and returns the parameters it ends with as the list `[w, b]`.

| Call                                                | Returns             |
| --------------------------------------------------- | ------------------- |
| `train([2, 4, 6, 8], [14, 20, 26, 32], 0.01, 1)`    | `[2.6, 0.46]`       |
| `train([2, 4, 6, 8], [14, 20, 26, 32], 0.01, 0)`    | `[0, 0]`            |
| `train([2, 4, 6, 8], [15, 23, 29, 33], 0.01, 5000)` | about `[3.0, 10.0]` |

After many steps, the parameters are very close to the best ones, but not quite there, like 9.9999992 instead of 10, so the checks round them to 2 decimal places first.

If one step gives `[2.6, 0.2]`, the slope for `b` was worked out with the new `w`. Work out both slopes first, and only then change the parameters.
