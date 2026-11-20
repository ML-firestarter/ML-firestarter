---
description: Find the slope of a loss for a ride, with the model's parameters left alone, and move the ride so that the loss goes up.
---

# Nudge the input

[The slope for an input](../../../../notes/05-pytorch/02-autograd.md#the-slope-for-an-input) found which way a ride has to move for the loss to grow, without touching the prices. Finish two functions that do it for any prices and any ride:

- `input_slope(prices, start, ride, fare)` returns the slope of the squared error, `(ride @ prices + start - fare) ** 2`, for the ride: a tensor with a slope for each of the ride's numbers.
- `nudge(prices, start, ride, fare, step)` returns a new ride: `ride` with each of its numbers moved by `step`, in the direction of the sign of its slope. That's the small change that raises the loss the most. It can call `input_slope`.

`prices` and `start` are a model's parameters, so they come marked, with `requires_grad=True`. `ride` is data: a plain tensor. Both functions leave all three as they found them: nothing new in the `.grad` of the parameters, and no mark on `ride`.

| Call, with the prices `[3.0, 0.5]`, the start `8.0` and the ride `[4.0, 6.0]` | Returns                    |
| ----------------------------------------------------------------------------- | -------------------------- |
| `input_slope(prices, start, ride, 30.0)`                                      | `tensor([-42., -7.])`      |
| `input_slope(prices, start, ride, 20.0)`                                      | `tensor([18., 3.])`        |
| `nudge(prices, start, ride, 30.0, 0.1)`                                       | `tensor([3.9000, 5.9000])` |
| `nudge(prices, start, ride, 20.0, 0.1)`                                       | `tensor([4.1000, 6.1000])` |
| `nudge(prices, start, ride, 23.0, 0.1)`                                       | `tensor([4., 6.])`         |

The prices give 23 for this ride. A receipt of 30 means the prediction is too low, so a shorter ride makes the miss bigger, and a receipt of 20 means it's too high, so a longer one does. With a receipt of 23, the prediction is exact: the slopes are 0, their sign is 0, and the ride stays where it is.

One check looks at what the call left behind, as `[slope, prices.grad, start.grad, prices.requires_grad, ride.requires_grad]`, which should be `[[-42.0, -7.0], None, None, True, False]`. If it finds tensors where the two `None` should be, the slopes came from `backward()`, which fills the `.grad` of everything that's marked: `torch.autograd.grad` returns only the slope it's asked for. If `ride.requires_grad` is `True`, the function marked the tensor it was given, and not a copy of it: `ride.clone()` is a copy of its own. And if `prices.requires_grad` is `False`, the function froze the prices it was given, and their owner can't train them any more.
