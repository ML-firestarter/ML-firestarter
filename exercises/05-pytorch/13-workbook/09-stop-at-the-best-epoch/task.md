---
description: Train until the validation loss stops improving, then go back to the weights of the best epoch.
---

# Stop at the best epoch

*Draws on [Batches and evaluation](../../../../notes/05-pytorch/06-batches-and-evaluation.md) for epochs and validation, and [Saving, loading and tuning](../../../../notes/05-pytorch/10-saving-loading-and-tuning.md) for state dicts, which keep and restore weights.*

A model trained for too long learns the training set's noise, and its validation loss starts to rise. **Early stopping** ends the training when that happens, and keeps the weights of the best epoch. Finish `fit_with_patience(model, run_epoch, validate, max_epochs, patience)`:

- `run_epoch(model)` trains the model for one epoch, and `validate(model)` gives its validation loss as a plain number. They're arguments, so that any training can be used.
- Epochs are numbered from 1. After each one, `validate` gives the loss. It's the best so far when it's **lower** than every loss before it.
- When `patience` epochs in a row haven't had a new best loss, the training stops. It also stops after `max_epochs` epochs.
- At the end, the model gets the weights it had at its best epoch, copied with `state_dict()` at that moment, and not just referred to. The function returns `[best_epoch, best_loss]`, with the loss rounded to 4 decimals.

| Call, with a model whose weight goes up by 1 every epoch, from 0, and a loss of `abs(weight - 3)` | Returns, and what happens                                      |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `fit_with_patience(model, run_epoch, validate, 10, 2)`                                             | `[3, 0.0]`, after 5 epochs, with the weight back at 3.0        |
| the same with `patience` 5                                                                         | `[3, 0.0]`, after 8 epochs                                     |

The losses are 2, 1, 0, 1, 2, 3, so the best epoch is the third. With a patience of 2, epochs 4 and 5 are the two that don't improve, and the training stops after the fifth.

> [!TIP]
> `model.state_dict()` refers to the model's own tensors, which later epochs change. Keep a copy: `{name: value.clone() for name, value in model.state_dict().items()}`.
