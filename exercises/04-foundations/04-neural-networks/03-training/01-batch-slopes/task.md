---
description: Average the slopes of the orders in a mini-batch, and take a step of gradient descent with them.
---

# Slopes for a batch

Finish two functions. `xs` has the input of each order in a mini-batch, and `turned_down` its label, 1 or 0, in the same order. In the checks, the inputs are the lengths of the rides, in km.

- `slopes(xs, turned_down, net)` returns the slopes of the log loss of the orders in `xs` for all 7 parameters, as a dict with the same names as `net`: for each parameter, the average of the orders' slopes, as in [All eight orders](../../../../../notes/04-foundations/04-neural-networks/02-backpropagation.md#all-eight-orders). `order_slopes` is done, and gives the slopes of one order. So far, `slopes` sets every slope to 0, but doesn't add anything to them.
- `step(xs, turned_down, net, learning_rate)` takes one step of gradient descent from `net`, with the slopes of the orders in `xs`, and returns the new parameters as a new dict. It mustn't change `net`.

| Call                               | Returns                                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `slopes([3, 12], [1, 1], NET)`     | about `{"w1": -1.097, "b1": -0.366, "w2": -0.938, "b2": -0.078, "v1": -0.183, "v2": -0.164, "c": -0.552}` |
| `slopes(KMS, TURNED_DOWN, NET)`    | about `{"w1": -0.261, "b1": -0.09, "w2": -0.2, "b2": -0.016, "v1": -0.079, "v2": -0.074, "c": -0.177}`    |
| `step(KMS, TURNED_DOWN, NET, 0.5)` | about `{"w1": -1.87, "b1": 6.045, "w2": 2.1, "b2": -21.992, "v1": 4.04, "v2": 4.037, "c": -2.912}`        |

The table rounds the numbers to 3 decimal places, but the checks don't. `KMS` and `TURNED_DOWN` are the eight orders from the lessons, and the last call is the step from the start of [Training a network](../../../../../notes/04-foundations/04-neural-networks/03-training.md).

If the slopes for all eight orders come out 8 times as big as in the table, they're added up, but not divided by the number of orders. If `NET` has changed after a call to `step`, `step` changes the dict it was given: put the new parameters in a new dict, or in a copy made with `dict(net)`.
