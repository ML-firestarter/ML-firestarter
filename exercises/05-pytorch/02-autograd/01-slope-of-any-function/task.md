---
description: Let autograd find the slope of any function at a point, without working out a formula.
---

# The slope of any function

In [One number](../../../../notes/05-pytorch/02-autograd.md#one-number), `backward()` found that $x^2$ has the slope 10 at $x = 5$, and the formula $2x$ was never needed. Finish `slope(f, x)`, which finds the slope of any function the same way.

`f` is a function that takes a tensor and gives a tensor with a single number, like `lambda x: x ** 2`. `x` is the point to find the slope at: a plain number, whole or not. `slope` returns the slope of `f` at `x` as a plain Python number.

| Call                                          | Returns |
| --------------------------------------------- | ------- |
| `slope(lambda x: x ** 2, 5.0)`                | `10.0`  |
| `slope(lambda x: 3 * x + 8, 100.0)`           | `3.0`   |
| `slope(lambda x: (3 * x + 8 - 23) ** 2, 4.0)` | `-18.0` |
| `slope(lambda x: x ** 3, 2)`                  | `12.0`  |

The third function is the squared error of a 3 km ride that cost 23, for a line with a bias of 8 and a weight of `x`. At a weight of 4, the line predicts 3 × 4 + 8 = 20, which is 3 too low, so raising the weight lowers the loss: that's why the slope is negative. Whatever `f` is, don't work its slope out yourself.

If `slope` raises a `RuntimeError` that says "Only Tensors of floating point and complex dtype can require gradients", the number was a whole one, like the `2` of the last call: make it a float first. If it gives `None`, `backward()` hasn't been called, or the slope was read from the wrong tensor: it's in the `.grad` of the tensor that `requires_grad`.
