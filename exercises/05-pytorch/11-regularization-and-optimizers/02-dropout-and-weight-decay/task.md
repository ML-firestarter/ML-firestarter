---
description: Build a classifier with dropout after each hidden layer, give it an optimizer with weight decay, and predict with dropout switched off.
---

# Dropout and weight decay

[Weight decay](../../../../notes/05-pytorch/11-regularization-and-optimizers.md#weight-decay) and [Dropout](../../../../notes/05-pytorch/11-regularization-and-optimizers.md#dropout) kept a network from learning its training pictures by heart. Finish three functions that set a network up with both:

- `make_model(n_inputs, n_hidden, n_classes, dropout)` returns an `nn.Sequential` with two hidden layers: `Linear`, `ReLU` and `Dropout`, the same three again, and a last `Linear` with an output for each class. Both hidden layers have `n_hidden` numbers, and both `Dropout` layers drop with the probability `dropout`.
- `make_optimizer(model, learning_rate, weight_decay)` returns `AdamW` for the model's parameters, with that learning rate and that weight decay.
- `predict(model, X)` returns the class that the model picks for each row of `X`, as a tensor of class numbers. It puts the model in evaluation mode first, so that nothing is dropped, and works inside `torch.no_grad()`.

| Call                               | Returns                                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `make_model(4, 8, 3, 0.5)`         | 7 layers: `Linear(4, 8)`, `ReLU`, `Dropout(0.5)`, `Linear(8, 8)`, `ReLU`, `Dropout(0.5)`, `Linear(8, 3)` |
| `make_optimizer(model, 0.01, 0.1)` | `AdamW`, with `lr` 0.01 and `weight_decay` 0.1                                                            |
| `predict(model, torch.ones(7, 4))` | 7 class numbers, the same ones every time                                                                 |

A `Dropout` layer has no weights, so a network with dropout starts from the same weights as one without it. One check uses that: it compares your network, in evaluation mode, with a plain one made from the same seed. Printing a model shows its layers, and printing an optimizer its settings, which helps when a check about them fails.

If `predict` gives other classes each time it's called for the same rows, the model is still in training mode, and dropout is setting other numbers to 0 at every call.
