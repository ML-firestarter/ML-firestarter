---
description: Count what a model has to learn, and list the shapes of its layers' weights.
---

# Count the parameters

[Stacking layers](../../../../notes/05-pytorch/07-a-network-with-nn-sequential.md#stacking-layers) counted the 2,231 numbers a network has to learn, and listed the shapes of its tensors. Finish two functions that do it for any model:

- `count_parameters(model)` returns the number of numbers in all of the parameters of `model`, weights and biases, as a whole number.
- `layer_shapes(model)` returns the shapes of the weights of the `nn.Linear` layers of an `nn.Sequential`, in order, as a list of tuples like `(out_features, in_features)`. Layers of other kinds, like `nn.ReLU`, are left out.

`make_mlp` is done, and it's the one of the last exercise.

| Call                                         | Returns                        |
| -------------------------------------------- | ------------------------------ |
| `count_parameters(make_mlp([2, 50, 40, 1]))` | `2231`                         |
| `count_parameters(make_mlp([3, 4, 1]))`      | `21`                           |
| `layer_shapes(make_mlp([2, 50, 40, 1]))`     | `[(50, 2), (40, 50), (1, 40)]` |

`model.parameters()` lists the tensors, and a tensor's `numel()` is how many numbers it has. A layer's weight has the shape `[out_features, in_features]`, as in [the `nn.Linear` lesson](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.md#a-layer-for-the-line), and `tuple(...)` turns a shape into a tuple. `isinstance(layer, nn.Linear)` is true for the layers to list.
