---
description: Train an nn.Linear for some epochs, and measure its RMSE on the validation set after each one.
---

# Train and validate

*Draws on [Linear regression with nn.Linear](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.md) for `nn.Linear`, `MSELoss` and `SGD`, and [Batches and evaluation](../../../../notes/05-pytorch/06-batches-and-evaluation.md) for epochs, evaluation and loaders.*

`make_loaders` from the last exercise and `evaluate(model, loader)`, which gives a model's RMSE over a loader as a plain number, are written for you. Finish `train_and_validate(model, train_loader, valid_loader, learning_rate, epochs)`:

- It trains `model` in place with `nn.MSELoss()` and `SGD` at `learning_rate`, for `epochs` epochs over `train_loader`, one step for every batch.
- After each epoch, it measures `evaluate(model, valid_loader)`, rounds it to 3 decimals, and adds it to a list.
- It returns the list: one RMSE for every epoch, and an empty list for 0 epochs.

| Call, with `nn.Linear(2, 1)` made after `torch.manual_seed(1)`, `make_loaders(X, y, 80, 20, 16)` and `learning_rate=0.05` | Returns                                                |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `train_and_validate(model, train_loader, valid_loader, 0.05, 6)`                                                        | `[19.565, 11.344, 6.565, 3.777, 2.18, 1.297]`          |

The RMSE falls as the line learns the fares, and with `learning_rate=0.0` it stays where it started. The code you start from measures but doesn't train, so the numbers never change.
