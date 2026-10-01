---
description: Work out the fare of every ride in a table, and the day's takings, with tensor arithmetic and no loop.
---

# Fares for every ride

In [Matrix multiplication](../../../../notes/05-pytorch/01-tensors.md#matrix-multiplication), a table times a vector gave the fares of four rides at once. Finish two functions that do it for any day:

- `fares(rides, prices, start)` returns a tensor with the fare of each ride. `rides` is a table with a row for each ride and a column for each fact about it, like its distance and the minutes of waiting. `prices` is a tensor with the price of one unit of each column, and `start` is the fee to start the taxi. A ride's fare is each of its numbers times the price of its column, added up, plus `start`.
- `takings(rides, prices, start)` returns the takings of the day: all the fares, added up, as a plain Python number and not as a tensor.

`DAY` holds the four rides of the lesson, and `PRICES` the prices of a kilometer and of a minute of waiting.

| Call                      | Returns                        |
| ------------------------- | ------------------------------ |
| `fares(DAY, PRICES, 8)`   | `tensor([15., 23., 29., 33.])` |
| `fares(DAY, PRICES, 0)`   | `tensor([ 7., 15., 21., 25.])` |
| `takings(DAY, PRICES, 8)` | `100.0`                        |

The checks also use tables with another number of rides, and of columns, so don't write 2 or 4 into your code. If `fares` raises a `RuntimeError` that says "size mismatch", the shapes of the table and of the prices don't fit, as in the lesson. If the checks say that `takings` gave `tensor(100.)`, and wanted `100.0`, it's the number inside the tensor that's needed: look at `.item()`.
