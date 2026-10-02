---
description: Work out the fares of many rides at once with a minimum, and the share of them above a limit.
---

# Fares with a fee

*Draws on [Tensors](../../../../notes/05-pytorch/01-tensors.md) for arithmetic, `clamp()` and comparisons on whole tensors.*

A taxi charges `per_km` for every kilometer, plus a `fee` for getting in, and never less than a `minimum`. Finish two functions that work on all the rides of a tensor at once, with no loop:

- `fares_with_fee(km, per_km, fee, minimum)` returns a tensor of the fares of the rides in `km`: `km * per_km + fee`, but at least `minimum`. The rides can be whole numbers or decimals, and a table of any shape works too.
- `share_above(fares, limit)` returns, as a plain number, the share of the fares that are above `limit`: 0.5 when half of them are.

| Call                                                           | Returns               |
| -------------------------------------------------------------- | --------------------- |
| `fares_with_fee(torch.tensor([1.0, 5.0, 10.0]), 2.0, 3.0, 8.0)` | `tensor([8., 13., 23.])` |
| `share_above(torch.tensor([5.0, 10.0, 20.0, 30.0]), 12.0)`     | `0.5`                 |

> [!TIP]
> A comparison like `fares > limit` gives a tensor of `True` and `False`. `.float()` turns it into 1s and 0s, and the mean of those is the share.
