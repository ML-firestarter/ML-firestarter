---
description: Try several learning rates, keep the best model as a checkpoint, and build a model back from it.
---

# Tune and keep

*Draws on [Saving, loading and tuning](../../../../notes/05-pytorch/10-saving-loading-and-tuning.md) for searching settings and saving models, [Batches and evaluation](../../../../notes/05-pytorch/06-batches-and-evaluation.md) for loaders and evaluation and [Linear regression with nn.Linear](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.md) for `nn.Linear`.*

`make_loaders`, `evaluate` and the loaders of 80 training, 20 validation and 20 test rides are in the code, and so is `train_model(learning_rate)`: it trains a new `nn.Linear(2, 1)` for 15 epochs at that learning rate and returns `(model, valid_rmse)`. Finish two functions:

- `search(learning_rates)` trains a model for each learning rate in the list, and returns a dictionary for the one with the lowest `valid_rmse`: its `"learning_rate"`, its `"valid_rmse"` and its `"model_state_dict"`, the model's `state_dict()`. When two models are equal, the earlier one stays.
- `load_best(checkpoint)` returns a new `nn.Linear(2, 1)` with the checkpoint's weights loaded, in evaluation mode.

| Call                                          | Returns                                                            |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `search([0.0001, 0.01, 0.1, 0.2])`            | a dictionary for the learning rate `0.2`, with an RMSE of about `0.73` |
| `load_best(search([0.1]))`                    | a model whose RMSE on the validation loader is the dictionary's    |

Too small a learning rate, like 0.0001, hasn't learned much in 15 epochs, and `0.01` is still far from the best. The checks also pass a checkpoint through `torch.save` and `torch.load(..., weights_only=True)` and build the model from what comes back, whose RMSE has to be the same.
