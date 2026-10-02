---
description: Write the loop over the batches of one epoch, taking a step for each, and return the mean loss.
---

# Train one epoch

[An epoch](../../../../notes/05-pytorch/06-batches-and-evaluation.md#an-epoch) goes through all the batches of the training set and takes a step for each. Finish `train_one_epoch(model, loader, criterion, optimizer)`, which does it for any model, and returns the mean of the losses of the batches as a plain number. `loader` gives pairs of features and labels, `criterion` is a loss function like `nn.MSELoss()`, and `optimizer` is made for the model's parameters. The model is trained in place.

The code already goes through the batches and adds up their losses. What it needs is the model in training mode, and for every batch the other steps: reset the slopes, `backward()` and `step()`. `X` and `y` hold the day rides of the lessons, and `make_model` is the one from the exercise of [the `nn.Linear` lesson](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.md).

| Call, with a model of zeros and `SGD` with `lr=0.01`                    | Returns               |
| ----------------------------------------------------------------------- | --------------------- |
| `train_one_epoch(model, loader, nn.MSELoss(), optimizer)`, batches of 2 | about `315.035`       |
| the same, with all 4 rides in one batch                                 | `671.0`, and one step |

The first batch of 2 rides has a loss of 377, and the second, after the first step, of about 253.07, and their mean is 315.0. With a single batch, there's one step, and the loss is the one before it. If the second epoch's loss isn't 23.2, the slopes weren't reset between the batches.
