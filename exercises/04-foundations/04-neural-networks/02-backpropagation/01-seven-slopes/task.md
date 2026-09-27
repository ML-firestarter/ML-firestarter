---
description: Do the forward and the backward pass for one order, and return the slopes of its penalty for all 7 parameters.
---

# Seven slopes

Write `order_slopes(km, turned_down, net)`, which returns the slopes of one order's penalty for all 7 parameters of the network `net`, as a dict with the same names as `net`. `km` is the length of the ride, and `turned_down` the order's label, 1 or 0. As in [Passing the error back](../../../../../notes/04-foundations/04-neural-networks/02-backpropagation.md#passing-the-error-back), it takes two passes:

1. The forward pass works out `h1`, `h2` and `p`.
2. The backward pass works out the output neuron's error, `delta = p - turned_down`, and from it, the errors of the two hidden neurons, `delta1` and `delta2`. Each slope is then a neuron's error times the input that the parameter multiplies, or for a bias, the error alone.

`sigmoid` is done, and `NET` holds the 7 parameters from the lessons.

| Call                       | Returns                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `order_slopes(3, 1, NET)`  | about `{"w1": -2.193, "b1": -0.731, "w2": 0.0, "b2": 0.0, "v1": -0.366, "v2": 0.0, "c": -0.731}` |
| `order_slopes(12, 1, NET)` | about `{"w1": 0.0, "b1": 0.0, "w2": -1.875, "b2": -0.156, "v1": 0.0, "v2": -0.328, "c": -0.372}` |
| `order_slopes(11, 0, NET)` | about `{"w1": 0.0, "b1": 0.0, "w2": 2.958, "b2": 0.269, "v1": 0.0, "v2": 0.134, "c": 0.269}`     |

The table rounds the numbers to 3 decimal places, but the checks don't. The slopes shown as `0.0` are tiny, but not exactly 0, as the flat parts of an S are never quite flat. In `NET`, `v1` and `v2` are both 4, so the checks also try other networks, where mixing them up shows.

If the slope for `w1` in the first call is about `-8.773`, the slope of the sigmoid, `h1 * (1 - h1)`, is missing from `delta1`. If every slope has the wrong sign, the output neuron's error was worked out as the label minus `p`, instead of `p` minus the label.
