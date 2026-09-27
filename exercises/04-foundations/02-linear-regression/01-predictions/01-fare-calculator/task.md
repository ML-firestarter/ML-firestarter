---
description: Work out taxi fares with any prices, for one ride or a whole list of rides.
---

# Fare calculator

In [Making predictions](../../../../../notes/04-foundations/02-linear-regression/01-predictions.md), `predict(km)` had the sticker's prices, 3 per km and 8 to start, written into it. A model that learns needs them as arguments, so that it can try other ones. Finish two functions:

- `predict(km, w, b)` returns the fare for a ride of `km` kilometers, with the price per km `w` and the starting fee `b`.
- `predict_all(kms, w, b)` takes a list of distances and returns the list of their fares, in the same order. The loop is already there, but it puts 0 in the list for every ride.

| Call                              | Returns            |
| --------------------------------- | ------------------ |
| `predict(5, 3, 8)`                | `23`               |
| `predict(10, 2.5, 4)`             | `29.0`             |
| `predict_all([2, 4, 6, 8], 3, 8)` | `[14, 20, 26, 32]` |
| `predict_all([], 3, 8)`           | `[]`               |

If `predict` passes its checks but `predict_all` doesn't, look at what the loop adds to the list: `predict_all` can call `predict` for each ride.
