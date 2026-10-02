---
description: Make an nn.Linear layer with the weights and the bias you give it, instead of random ones.
---

# A model with chosen weights

[Training](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.md#training) copied the weights of the by-hand lesson into a layer, to start from the same place. Finish `make_model(weights, bias)`, which makes an `nn.Linear` with one output, and as many inputs as there are numbers in the list `weights`, that starts from exactly those weights, and the number `bias` as its bias.

The layer's weight has the shape `[1, inputs]`, a row, and `weights` is a plain list, so it has to be made a row of a tensor before it's copied in. The weights require grad, so changing them is done inside `torch.no_grad()`.

| Call                                                      | Returns                                  |
| --------------------------------------------------------- | ---------------------------------------- |
| `make_model([3.0, 0.5], 8.0).weight`                      | a weight with the numbers `[[3.0, 0.5]]` |
| `make_model([3.0, 0.5], 8.0).bias`                        | a bias with the number `[8.0]`           |
| `make_model([3.0, 0.5], 8.0)(torch.tensor([[4.0, 6.0]]))` | a prediction of `23.0`                   |

The model is still a layer to train: its weight and bias have to require grad, as they do when the layer makes them, and `model.parameters()` has to list them. If the layer predicts something else than 23, the numbers of the weights or the bias didn't get in.
