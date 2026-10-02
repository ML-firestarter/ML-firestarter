---
description: Train any model with a loss function and an optimizer, and keep the loss of every epoch.
---

# Train a model

[Training](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.md#training) trained a layer with `nn.MSELoss` and `torch.optim.SGD`. Finish `train(model, X, y, learning_rate, n_epochs)`, which trains `model` on the table `X` and the labels `y` for `n_epochs` epochs of gradient descent, with the mean squared error as the loss, and returns the list of the loss of every epoch, as plain numbers, the first one being the loss before any step. It trains the model it's given, in place.

`make_model` is the one of the last exercise, and `X` and `y` hold the day rides of the lessons.

| Call                                                | Returns                         |
| --------------------------------------------------- | ------------------------------- |
| `train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 3)` | about `[671.0, 15.162, 10.894]` |
| `train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 0)` | `[]`                            |

After 5,000 epochs, the model is the sticker's: weights of 3 and 0.5, and a bias of 8. The code already has the criterion and the loop that keeps the losses. What it needs is an optimizer, and in the loop, the other steps: `backward()`, `step()` and `zero_grad()`. If your losses come out the same on every epoch, nothing took a step.
