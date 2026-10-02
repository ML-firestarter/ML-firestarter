---
description: Work out the predictions of a linear regression for a table of rides, and its mean squared error, whatever shape the labels come in.
---

# Predict and score

In [The model and its loss](../../../../notes/05-pytorch/04-linear-regression-by-hand.md#the-model-and-its-loss), the predictions were $Xw + b$ and the loss was their mean squared error. Finish two functions:

- `predict(X, w, b)` returns the predictions for the rows of `X`, a tensor of the shape `[rides, 1]`. `w` is a tensor of the shape `[features, 1]`, and `b` a number.
- `mse(y_pred, y)` returns the mean squared error of the predictions `y_pred`, of the shape `[rides, 1]`, against the labels `y`, as a plain Python number. The labels may come as `[rides, 1]` or as `[rides]`, and either way, each prediction has to be compared with its own label.

`X` holds the four day rides of the lessons, `y` their fares, and `w` the sticker's prices of a kilometer and a minute.

| Call                                   | Returns                                |
| -------------------------------------- | -------------------------------------- |
| `predict(X, w, 8.0)`                   | `tensor([[15.], [23.], [29.], [33.]])` |
| `mse(predict(X, w, 8.0), y)`           | `0.0`                                  |
| `mse(predict(X, w, 0.0), y)`           | `64.0`                                 |
| `mse(predict(X, w, 8.0), y.flatten())` | `0.0`                                  |

Without a bias, each fare is 8 too low, and 8 × 8 is 64. If `mse` gives a big number for the labels with the shape `[rides]`, the two tensors were broadcast into a table: look at [the shapes](../../../../notes/05-pytorch/04-linear-regression-by-hand.md#the-model-and-its-loss), and give the labels the shape of the predictions.
