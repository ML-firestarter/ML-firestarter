---
description: Write the two halves of a checkpoint, keeping a model with the settings that built it, and building it back with its weights.
---

# Save and load a checkpoint

[Saving a model](../../../../notes/05-pytorch/10-saving-loading-and-tuning.md#saving-a-model) kept a model's state dict with its hyperparameters, and built a model back from them. Finish two functions:

- `make_checkpoint(model, hyperparameters)` returns the dictionary to save: the model's state dict under the key `"model_state_dict"`, and `hyperparameters` under the key `"hyperparameters"`.
- `build_from_checkpoint(checkpoint)` returns a new model, made by `make_model` from the checkpoint's hyperparameters, with the saved weights loaded into it and in evaluation mode.

`make_model(n_inputs, n_hidden, n_classes)` is done. It makes a network with a hidden layer, and `hyperparameters` is a dictionary with its three arguments, like `{"n_inputs": 2, "n_hidden": 3, "n_classes": 2}`, which can be passed with `make_model(**hyperparameters)`.

| Call                                                      | Returns                                                     |
| --------------------------------------------------------- | ----------------------------------------------------------- |
| `make_checkpoint(model, settings).keys()`                 | the keys `"model_state_dict"` and `"hyperparameters"`       |
| `build_from_checkpoint(make_checkpoint(model, settings))` | a model with the weights of `model`, that predicts the same |

The checks also save a checkpoint into memory with `torch.save`, load it with `torch.load(..., weights_only=True)`, and build a model from what comes back, which has to predict the same as the original, number for number. A model made by `make_model` starts with random weights, so if the predictions differ, the saved weights didn't get in.
