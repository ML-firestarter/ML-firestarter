---
description: Work out the slopes of the loss for both parameters, and take one step against them.
---

# One step downhill

Finish two functions:

- `slopes(kms, fares, w, b)` returns the list `[slope_w, slope_b]`: the slope of the MSE for `w` and the one for `b`, at the line with those parameters. It already works out `slope_w`, but `slope_b` stays 0.
- `step(kms, fares, w, b, learning_rate)` takes one step of gradient descent from `w` and `b`, and returns the new parameters as the list `[w, b]`.

The slope for `b` is worked out like the one for `w`, but without multiplying by the distance, as in [Both parameters at once](../../../../../notes/04-foundations/02-linear-regression/03-training.md#both-parameters-at-once). `step` can call `slopes`.

| Call                                                 | Returns           |
| ---------------------------------------------------- | ----------------- |
| `slopes([2, 4, 6, 8], [14, 20, 26, 32], 0, 8)`       | `[-180.0, -30.0]` |
| `slopes([2, 4, 6, 8], [15, 23, 29, 33], 3, 10)`      | `[0.0, 0.0]`      |
| `step([2, 4, 6, 8], [14, 20, 26, 32], 0, 8, 0.01)`   | `[1.8, 8.3]`      |
| `step([2, 4, 6, 8], [15, 23, 29, 33], 3, 10, 0.01)`  | `[3.0, 10.0]`     |

At the best line, both slopes are 0, so a step leaves the parameters where they are. If `step` moves them the wrong way, check the sign: a step takes the slope away, it doesn't add it.
