---
description: Make an optimizer by its name, and compare several of them fairly, each from the same starting weights.
---

# Compare optimizers

[On the digits](../../../../notes/05-pytorch/11-regularization-and-optimizers.md#on-the-digits) trained the same network with three optimizers. Such a comparison is only fair when everything else is the same: the data, the number of steps, and the weights that the network starts from. Finish two functions:

- `make_optimizer(name, parameters, learning_rate)` returns the optimizer called `name` for `parameters`, with that learning rate. `"sgd"` is plain `SGD`, `"momentum"` is `SGD` with a momentum of 0.9, and `"adam"` is `Adam`. Any other name raises a `ValueError`.
- `compare(names, learning_rate, steps)` trains a network with each of the optimizers in `names`, and returns a dictionary with the loss that each one ends at, by its name. Every optimizer gets a network of its own, made by `make_model()` right after `torch.manual_seed(0)`, so that all of them start from the same weights.

`make_model()` and `train(model, optimizer, steps)` are written for you. `train` takes `steps` steps on 64 rides whose fares bend at 6 km, and returns the loss after them, rounded to 4 decimals.

| Call                                             | Returns                                               |
| ------------------------------------------------ | ----------------------------------------------------- |
| `compare(["sgd", "momentum", "adam"], 0.01, 20)` | `{"sgd": 0.1885, "momentum": 0.0692, "adam": 0.0475}` |
| `compare(["adam", "sgd"], 0.01, 50)`             | `{"adam": 0.0089, "sgd": 0.0358}`                     |
| `compare(["sgd", "momentum", "adam"], 0.01, 0)`  | `{"sgd": 0.56, "momentum": 0.56, "adam": 0.56}`       |

The last row shows that the comparison is fair. With no steps, the three networks are still what they started as, and they have the same loss only if they have the same weights.

The code you start from trains one network with all the optimizers, one after another. The second optimizer carries on from where the first one stopped, so it looks better than it is, and the numbers change with the order of the names. If yours still do, the networks aren't starting from the same weights: each one has to be made anew, and the seed set again before it.
