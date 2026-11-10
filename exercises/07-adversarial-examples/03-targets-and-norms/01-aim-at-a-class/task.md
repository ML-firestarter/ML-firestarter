---
description: Write a targeted PGD, which changes pictures so that a network reads the class that the attacker chose.
---

# Aim at a class

[Towards a class](../../../../notes/07-adversarial-examples/03-targets-and-norms.md#towards-a-class) made the network read a 1 as a 7. Write that attack for any network:

- `targeted_pgd(model, X, target, epsilon, alpha, steps)` starts from the pictures `X` and takes `steps` steps. Each step takes the slopes of the loss for the targets, `criterion(model(X_adv), target)`, for the pictures as they are by then, moves every pixel by `alpha` in the direction that lowers that loss, and projects the result into the ε-ball around `X`. It returns the pictures after the last step.

`target` has the class that the attacker wants for each picture. `project` is written for you. As before, the function returns a tensor that doesn't require grad, and leaves no mark on `X` and nothing in the `.grad` of the model's parameters.

`darkest_pixel()` makes the network that says which of the four pixels of a 2×2 picture is the darkest. To get it to name a pixel, that pixel has to get darker, and the other three lighter:

| `X`, one picture           | `target` | `epsilon` | `alpha` | `steps` | `targeted_pgd` returns         | The network reads |
| -------------------------- | -------- | --------- | ------- | ------- | ------------------------------ | ----------------- |
| `[[0.9, 0.2], [0.4, 0.1]]` | `2`      | `0.1`     | `0.04`  | `1`     | `[[0.86, 0.16], [0.44, 0.06]]` | `0`               |
| `[[0.9, 0.2], [0.4, 0.1]]` | `2`      | `0.1`     | `0.04`  | `3`     | `[[0.8, 0.1], [0.5, 0.0]]`     | `0`               |
| `[[0.9, 0.2], [0.4, 0.1]]` | `2`      | `0.3`     | `0.1`   | `5`     | `[[0.6, 0.0], [0.7, 0.0]]`     | `2`               |
| `[[0.9, 0.2], [0.4, 0.1]]` | `3`      | `0.5`     | `0.1`   | `6`     | `[[0.4, 0.0], [0.0, 0.6]]`     | `3`               |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0`      | `0.1`     | `0.04`  | `3`     | `[[1.0, 0.1], [0.3, 0.0]]`     | `0`               |

The target of the first three rows is pixel 2, the one at 0.4. With ε = 0.1, the attack can't get it past the 0.9 of pixel 0, which only comes down to 0.8, and the network goes on reading 0. With ε = 0.3, the two pixels pass each other, and the network reads 2. The hardest target is pixel 3, the lightest of the four, at 0.1. It's reached with ε = 0.5, and any ε over 0.4 would do: the two pixels start 0.8 apart, and each moves by ε.

In the last row, the target is what the network reads already, and the attack makes it surer.

The code you start from returns the pictures as they are. The checks use `small_network()` too, a network with a hidden layer whose slopes change as the pictures move, and one check watches what your function shows the network: no picture that the model is called with may be outside the ball.
