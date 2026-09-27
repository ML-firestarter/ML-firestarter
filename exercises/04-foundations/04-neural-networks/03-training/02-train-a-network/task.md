---
description: Make a random start from a seed, and train a network from it with gradient descent.
---

# Train a network

Finish two functions:

- `start(seed)` returns a random start for the network, as in [Where to start](../../../../../notes/04-foundations/04-neural-networks/03-training.md#where-to-start): it sets the seed to `seed`, and then gives each of the 7 parameters a random number between −1 and 1, in the order `w1`, `b1`, `w2`, `b2`, `v1`, `v2`, `c`.
- `train(xs, turned_down, learning_rate, steps, seed)` trains a network as in [Training the network](../../../../../notes/04-foundations/04-neural-networks/03-training.md#training-the-network): it starts from `start(seed)`, takes `steps` steps of gradient descent on all the orders in `xs`, with the learning rate `learning_rate`, and returns the parameters it ends with.

`loss`, `slopes` and the functions they use are done. `KMS` and `TURNED_DOWN` are the eight orders from the lessons, and `XS` their distances from the middle, 7 km.

| Call                                                                      | Returns                                                                                                 |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `start(7)`                                                                | about `{"w1": -0.352, "b1": -0.698, "w2": 0.302, "b2": -0.855, "v1": 0.072, "v2": -0.269, "c": -0.884}` |
| `train(XS, TURNED_DOWN, 0.5, 0, 7)`                                       | the same as `start(7)`                                                                                  |
| `train(XS, TURNED_DOWN, 0.5, 1, 7)`                                       | about `{"w1": -0.355, "b1": -0.698, "w2": 0.283, "b2": -0.858, "v1": 0.117, "v2": -0.216, "c": -0.773}` |
| `round(loss(XS, TURNED_DOWN, train(XS, TURNED_DOWN, 0.5, 5000, 7)), 3)`   | `0.005`                                                                                                 |
| `round(loss(KMS, TURNED_DOWN, train(KMS, TURNED_DOWN, 0.5, 5000, 1)), 2)` | `0.49`                                                                                                  |

The table rounds the parameters to 3 decimal places, but the checks don't. The last two calls round the loss themselves, so that tiny differences in the arithmetic of 5,000 steps don't matter. The last call starts from seed 1, with km as the input: the start that gets stuck in [Not every start works](../../../../../notes/04-foundations/04-neural-networks/03-training.md#not-every-start-works).

If the numbers from `start(7)` are right, but on the wrong parameters, the random numbers are drawn in another order. If one step gives other parameters than in the table, check that `train` works out all 7 slopes before it changes any parameter.
