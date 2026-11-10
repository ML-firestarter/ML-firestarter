---
description: Write one module that builds an MLP from a list of sizes, and can also send its input straight to the output layer.
---

# A module with a skip

*Draws on [A network with nn.Sequential](../../../../notes/05-pytorch/07-a-network-with-nn-sequential.md) for stacking `nn.Linear` and `nn.ReLU`, and [Your own modules](../../../../notes/05-pytorch/08-your-own-modules.md) for modules and `torch.cat`.*

Finish `MLP(sizes, skip=False)`, a module that makes the networks of lesson 7 and lesson 8 from a list of layer sizes:

- `self.deep` is an `nn.Sequential` of `nn.Linear(sizes[i], sizes[i + 1])` and a `nn.ReLU()` after each, for every pair of sizes except the last. With `sizes = [3, 1]` there's none, and `self.deep` is empty.
- `self.output` is the last `nn.Linear`. It takes the `sizes[-2]` numbers of the deep path, and, when `skip` is true, the `sizes[0]` input features too, in front of them. It gives `sizes[-1]` numbers.
- `forward(X)` runs `X` through `self.deep`. With `skip`, it joins `X` and the result with `torch.cat(..., dim=1)`, `X` first. It returns what `self.output` gives.

| Call                                  | Parameters                    |
| ------------------------------------- | ----------------------------- |
| `MLP([2, 50, 40, 1])`                 | 2,231                         |
| `MLP([2, 50, 40, 1], skip=True)`      | 2,233: the output layer takes 42 numbers, not 40 |
| `MLP([3, 1], skip=True)`              | 7                             |

The checks count the parameters, look at the layers and the shape of the output layer's weights, and set weights by hand to see that with `skip` the output can be made of the input alone, and without it, of nothing but the bias.
