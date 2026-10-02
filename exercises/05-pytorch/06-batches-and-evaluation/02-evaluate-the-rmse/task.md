---
description: Measure a model over all the batches of a loader, with the RMSE of all the rides and not the mean of the batches' RMSEs.
---

# Evaluate the RMSE

[Evaluating](../../../../notes/05-pytorch/06-batches-and-evaluation.md#evaluating) put the model in evaluation mode, worked out the predictions with no record, and measured the RMSE of all the rides, which isn't the mean of the RMSEs of the batches when the last batch is smaller. Finish `evaluate_rmse(model, loader)`, which returns the RMSE of the model's predictions for all the rides in `loader`, as a plain number: the root of the mean of the squared errors of every ride. `loader` gives pairs of features and labels, of the shape `[rows, 1]`.

`X` and `y` hold the day rides of the lessons, and `make_model` is the one from the last exercises. The code has the loop's skeleton; what it needs is to go through the batches with no record, and add up the squared errors and the number of rides.

| Call                                                 | Returns        |
| ---------------------------------------------------- | -------------- |
| `evaluate_rmse(make_model([3.0, 0.0], 8.0), loader)` | about `2.2361` |
| `evaluate_rmse(make_model([3.0, 0.5], 8.0), loader)` | `0.0`          |

The first model leaves out the waiting: its errors on the four rides are 1, 3, 3 and 1, so its mean squared error is 5 and the RMSE is √5. The checks try loaders with batches of 1, 3 and 4 rides, and the answer must be the same for all of them. With batches of 3, the mean of the two batches' RMSEs would be about 1.76, which is not the RMSE of the four rides.
