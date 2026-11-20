---
description: Write PGD for any network, with small steps along the sign of the slope, each followed by a projection back into the ε-ball.
---

# Projected gradient descent

Write [PGD](../../../../notes/07-adversarial-examples/02-pgd.md#projected-gradient-descent) as a function that works for any network:

- `pgd(model, X, y, epsilon, alpha, steps)` starts from the pictures `X` and takes `steps` steps. Each step takes the slopes of the loss, `criterion(model(X_adv), y)`, for the pictures as they are by then, moves every pixel by `alpha` in the direction of the sign of its slope, and projects the result into the ε-ball around `X`. It returns the pictures after the last step.

`project` is written for you. As in [One step with FGSM](../../01-fooling-a-network/01-one-step-with-fgsm/task.md), the function returns a tensor that doesn't require grad, and leaves no mark on `X` and nothing in the `.grad` of the model's parameters.

`darkest_pixel()` makes the network that says which of the four pixels of a 2×2 picture is the darkest. Every step takes `alpha` off the labelled pixel and adds `alpha` to the other three, until the ball stops them:

| `X`, one picture           | `y` | `epsilon` | `alpha` | `steps` | `pgd` returns                  |
| -------------------------- | --- | --------- | ------- | ------- | ------------------------------ |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `1`     | `[[0.86, 0.24], [0.44, 0.14]]` |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `2`     | `[[0.82, 0.28], [0.48, 0.18]]` |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `3`     | `[[0.8, 0.3], [0.5, 0.2]]`     |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `10`    | `[[0.8, 0.3], [0.5, 0.2]]`     |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.3`     | `0.1`   | `5`     | `[[0.6, 0.5], [0.7, 0.4]]`     |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `0`     | `[[0.9, 0.2], [0.4, 0.1]]`     |

The third step would take the pixels 0.12 away from where they started, and the projection brings them back to 0.1. From then on, more steps change nothing.

The code you start from takes one step, whatever `steps` says. The checks also use `small_network()`, a network with a hidden layer whose slopes change as the pictures move, so the slopes have to be taken anew at every step, at the pictures as they are then, and not once at `X`.

One check watches what your function shows the network: no picture that the model is called with may be outside the ball. So the projection comes after every step, and not once at the end.
