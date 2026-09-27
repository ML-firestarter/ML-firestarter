---
description: Standardize the length of each ride and its square, and train logistic regression on them, so that it draws the U without a hidden layer.
---

# A U without a hidden layer

Finish two functions, to train logistic regression on km and km², as in [Preparing the inputs](../../../../../notes/04-foundations/04-neural-networks/04-inputs.md):

- `inputs(km)` returns the two inputs for a ride of `km` km, standardized as in [Standardizing the inputs](../../../../../notes/04-foundations/04-neural-networks/04-inputs.md#standardizing-the-inputs): km, minus `KM_AVERAGE`, divided by `KM_SPREAD`, and km², minus `SQUARE_AVERAGE`, divided by `SQUARE_SPREAD`. It returns them as a tuple, like `return x1, x2`. So far, it returns km and km² as they are.
- `train(learning_rate, steps)` starts with both weights and the bias at 0, takes `steps` steps of gradient descent with the learning rate `learning_rate`, and returns the weights and the bias that it ends with, as a tuple, like `return w1, w2, b`. `slopes(weights)` gives the slopes for `w1`, `w2` and `b`, in that order.

`predict`, `loss` and `slopes` are done, and take the weights and the bias as a tuple too. `TURNED_DOWN` has how many of the 100 orders of each length were turned down, and the averages and spreads are the ones from the lesson. `SQUARE_SPREAD` is the lesson's 65.48, before rounding: the square root of 4,288.

| Call                                    | Returns                        |
| --------------------------------------- | ------------------------------ |
| `inputs(8)`                             | about `(0.0, -0.244)`          |
| `inputs(14)`                            | about `(1.5, 1.771)`           |
| `train(1, 0)`                           | `(0, 0, 0)`                    |
| `train(1, 1)`                           | about `(0.103, 0.155, -0.181)` |
| `round(loss(train(1, 1000)), 3)`        | `0.439`                        |
| `round(predict(5, train(1, 10000)), 3)` | `0.103`                        |

The table rounds to 3 decimal places, but the checks don't. The last two calls round the loss and the probability themselves, so that tiny differences in the arithmetic of thousands of steps don't matter. After 10,000 steps, the weights and the bias are about −6.04, 6.75 and −1.03, as in [New orders](../../../../../notes/04-foundations/04-neural-networks/04-inputs.md#new-orders).

If `train(1, 0)` doesn't give `(0, 0, 0)`, the loop goes round once too often: with 0 steps, the weights and the bias stay at 0.

If `train` raises an `OverflowError`, check `inputs` first. On km and km² as they are, a learning rate of 1 is far too big: after a single step, the weights are so far off that the result of `math.exp` in `sigmoid` gets too big for Python to hold.

If a check shows the right numbers, but in square brackets, the function returns a list: return a tuple, like `return x1, x2`, instead.
