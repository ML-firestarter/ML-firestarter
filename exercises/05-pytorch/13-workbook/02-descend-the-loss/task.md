---
description: Get the slopes of the loss of a line from autograd, and take gradient descent steps with them.
---

# Descend the loss

*Draws on [Autograd](../../../../notes/05-pytorch/02-autograd.md) for `backward()`, `no_grad()` and resetting slopes, and [Tensors](../../../../notes/05-pytorch/01-tensors.md) for `mean()`.*

`km` and `fares` hold the day's four rides of the lessons. The loss of the line with weight `w` and bias `b` is the mean of the squared errors, `((w * km + b - fares) ** 2).mean()`. Finish two functions:

- `loss_slopes(w, b)` returns the slopes of the loss for `w` and `b`, as a list of two plain numbers rounded to 4 decimals.
- `descend(w, b, learning_rate, steps)` starts from `w` and `b`, takes `steps` steps of gradient descent, and returns the new `w` and `b` as a list of two numbers rounded to 3 decimals.

| Call                            | Returns            |
| ------------------------------- | ------------------ |
| `loss_slopes(0.0, 0.0)`         | `[-280.0, -50.0]`  |
| `descend(0.0, 0.0, 0.01, 1)`    | `[2.8, 0.5]`       |
| `descend(0.0, 0.0, 0.01, 5000)` | `[3.0, 10.0]`      |

Each step goes forward, backward, steps inside `torch.no_grad()` and resets the slopes. The first step from 0 and 0 is 0.01 times the two slopes, and 0.01 × 280 = 2.8.
