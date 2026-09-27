---
description: Write the sigmoid, and a rule that turns a wait into the probability of a cancellation, with any weight and bias.
---

# Probability calculator

In [Predicting a probability](../../../../../notes/04-foundations/03-logistic-regression/01-probabilities.md), `probability(wait)` used a weight and a bias set outside it, 0.5 and −4. A model that learns needs them as arguments, so that it can try other ones. Finish two functions:

- `sigmoid(z)` returns the sigmoid of `z`, from [Squashing the line](../../../../../notes/04-foundations/03-logistic-regression/01-probabilities.md#squashing-the-line). `math.exp(x)` works out e to the power of `x`.
- `probability(wait, w, b)` returns the probability that an order with a wait of `wait` minutes will be cancelled, by the rule with the weight `w` and the bias `b`. It already works out the line's output, `z`, but returns it as it is.

| Call                      | Returns       |
| ------------------------- | ------------- |
| `sigmoid(0)`              | `0.5`         |
| `sigmoid(2)`              | about `0.881` |
| `probability(8, 0.5, -4)` | `0.5`         |
| `probability(6, 0.5, -4)` | about `0.269` |
| `probability(6, 1, -8)`   | about `0.119` |

The table rounds the probabilities to 3 decimal places, but the checks don't, so don't round them in the functions.

If `probability(6, 0.5, -4)` gives `-1.0`, it returns the line's output as it is: squash it with `sigmoid` first.
