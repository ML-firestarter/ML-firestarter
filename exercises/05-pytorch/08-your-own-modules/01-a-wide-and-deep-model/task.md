---
description: Write a wide and deep module that takes two inputs, runs one through a small deep stack, and joins both before its output layer.
---

# A wide and deep model

[Your own modules](../../../../notes/05-pytorch/08-your-own-modules.md#two-inputs) wrote a module that takes two tensors. Finish `WideAndDeep(n_wide, n_deep, hidden=8)`, a module of the same kind with a smaller deep path:

1. `n_wide` is the number of columns of the wide input, and `n_deep` that of the deep input.
2. `self.deep_stack` is an `nn.Sequential` of `nn.Linear(n_deep, hidden)` and a `nn.ReLU()`.
3. `self.output_layer` is an `nn.Linear` that takes the wide columns and the `hidden` numbers of the deep path, side by side, in that order, and gives 1 number.
4. `forward(X_wide, X_deep)` runs `X_deep` through the deep stack, joins `X_wide` and the result with `torch.cat(..., dim=1)`, and returns what the output layer gives.

| Call                                                          | Returns                                  |
| ------------------------------------------------------------- | ---------------------------------------- |
| `WideAndDeep(2, 3, hidden=4)`, its parameters                 | 23 numbers, in 4 tensors                 |
| `WideAndDeep(2, 3)(torch.ones(7, 2), torch.ones(7, 3))`       | a tensor of the shape `[7, 1]`           |

The tests count the parameters, look at their shapes, and also set the weights by hand to see where each path goes: with the deep path's weights at 0, the output has to be made of the wide columns alone, and the other way round. Mind the order in `torch.cat`, and call `super().__init__()` before the first layer.
