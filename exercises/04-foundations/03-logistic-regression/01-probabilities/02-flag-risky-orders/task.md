---
description: Find where a rule's decision changes, and pick out the orders it predicts will be cancelled.
---

# Flag risky orders

The company wants to offer a discount on every order that the rule predicts will be cancelled. Write two functions:

- `boundary(w, b)` returns the decision boundary of the rule with the weight `w` and the bias `b`: the wait at which the line's output is 0, and the probability 0.5, as in [From a probability to a decision](../../../../../notes/04-foundations/03-logistic-regression/01-probabilities.md#from-a-probability-to-a-decision). When `w` is 0, the line's output is the same for every wait, so there's no boundary, and `boundary` raises a `ValueError`.
- `flagged(waits, w, b)` takes a list of waits, and returns the list of the ones the rule predicts will be cancelled, with a threshold of 0.5, in the same order. A wait right on the boundary counts, as its probability is exactly 0.5.

| Call                                         | Returns             |
| -------------------------------------------- | ------------------- |
| `boundary(0.5, -4)`                          | `8.0`               |
| `boundary(0.4, -2)`                          | `5.0`               |
| `boundary(0, 1)`                             | raises `ValueError` |
| `flagged([2, 4, 6, 8, 10, 12, 14], 0.5, -4)` | `[8, 10, 12, 14]`   |
| `flagged([3, 9, 5], 0.5, -4)`                | `[9]`               |
| `flagged([2, 10], -0.5, 4)`                  | `[2]`               |

With a weight of 0, the rule gives every order the same probability, so `flagged` picks either all the waits or none of them. With a negative weight, the probability drops as the wait grows. If the last call gives `[10]`, `flagged` picks the waits past the boundary, which only works for a positive weight. Deciding by the sign of the line's output works for any weight.
