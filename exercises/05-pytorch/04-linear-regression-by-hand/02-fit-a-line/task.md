---
description: Train a linear regression on any table of features with tensors and autograd, starting from zeros, and return what it found.
---

# Fit a line

[Training](../../../../notes/05-pytorch/04-linear-regression-by-hand.md#training) trained a linear regression with the loop of four steps. Finish `fit(X, y, learning_rate, n_epochs)`, which does it for any table. `X` has a row for each ride and a column for each feature, and `y` the labels, of the shape `[rides, 1]`. `fit` starts from weights of 0, one for each feature, and a bias of 0, takes `n_epochs` steps of gradient descent on the mean squared error, and returns the pair `(weights, bias)`: the weights as a list of numbers, and the bias as a number.

The code already has the parameters and the line `loss = ...`. What it needs is the other steps: `backward()`, the step inside `torch.no_grad()`, and the reset of the slopes. `X` and `y` hold the day rides of the lessons.

| Call                    | Returns                    |
| ----------------------- | -------------------------- |
| `fit(X, y, 0.01, 0)`    | `([0.0, 0.0], 0.0)`        |
| `fit(X, y, 0.01, 1)`    | about `([2.8, 2.04], 0.5)` |
| `fit(X, y, 0.01, 5000)` | about `([3.0, 0.5], 8.0)`  |

After 5,000 epochs, the line is the sticker's: €3 for a kilometer, €0.50 for a minute of waiting and €8 to start, because the day rides follow it exactly. The checks also use tables with another number of features, so take the number of weights from `X`, and not from a number in your code. If the second epoch goes further than it should, the slopes of the first were not reset.
