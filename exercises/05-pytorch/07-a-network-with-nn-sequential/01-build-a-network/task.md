---
description: Make a network from a list of layer sizes, with a ReLU between the layers and none after the last.
---

# Build a network

[Stacking layers](../../../../notes/05-pytorch/07-a-network-with-nn-sequential.md#stacking-layers) wrote a network out layer by layer. Finish `make_mlp(sizes)`, which makes the same kind of network from a list of sizes: `sizes[0]` is the number of features that go in, `sizes[-1]` the number of numbers that come out, and the ones between are the sizes of the hidden layers. It returns an `nn.Sequential` of `nn.Linear` layers, one for each pair of neighbouring sizes, with an `nn.ReLU()` after every layer but the last.

| Call                       | Returns                                                            |
| -------------------------- | ------------------------------------------------------------------ |
| `make_mlp([2, 50, 40, 1])` | `Linear(2, 50)`, `ReLU`, `Linear(50, 40)`, `ReLU`, `Linear(40, 1)` |
| `make_mlp([3, 1])`         | just `Linear(3, 1)`                                                |

The last layer has no ReLU, because it gives the prediction, and a ReLU would never let it be negative. The checks look at the kinds of layers and their shapes, and run the network on tables of rows, so the sizes of the layers have to meet. A loop over the pairs of sizes, `sizes[i]` and `sizes[i + 1]`, makes the layers, and the ReLU goes in unless it's the last one.
