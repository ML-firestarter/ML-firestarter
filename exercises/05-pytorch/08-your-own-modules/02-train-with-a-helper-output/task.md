---
description: Train a model that takes two inputs and returns two outputs for one epoch, with a helper loss added to the main one.
---

# Train with a helper output

[The last section of Your own modules](../../../../notes/05-pytorch/08-your-own-modules.md#two-outputs) trained a model with a helper output. Finish `train_one_epoch(model, loader, optimizer, criterion, aux_weight)`, which does an epoch of it and returns the mean loss of the batches as a plain number:

- `loader` gives three tensors for every batch: the wide inputs, the deep inputs and the labels.
- `model(X_wide_batch, X_deep_batch)` returns two outputs, the main one and the helper's. The model `WithHelper` is written for you, and so are the tensors `X_wide`, `X_deep` and `y`, a few rides with standardized features.
- A batch's loss is `criterion(main_output, y_batch)` plus `aux_weight` times `criterion(aux_output, y_batch)`. That whole loss is what gets the slopes and what's added up for the mean.
- Every batch takes a step, and the slopes are reset before the slopes of the next one are worked out.

The code goes through the batches and adds up their losses, but only the main output's, and takes no steps. It needs the helper's part of the loss, and the steps.

| Call, with `WithHelper(1, 2)` made after `torch.manual_seed(0)`, `SGD` with `lr=0.1` and batches of 2 | Returns         |
| ---------------------------------------------------------------------------------------------------- | --------------- |
| `train_one_epoch(model, loader, optimizer, nn.MSELoss(), 0.5)`                                       | about `1.0495`  |
| the same, with `aux_weight=0`                                                                        | about `0.7691`  |

With a weight of 0, the helper takes no part in the loss, and the mean is the main loss of the two batches. If the second epoch's loss isn't about 0.692, the slopes weren't reset between the batches.
