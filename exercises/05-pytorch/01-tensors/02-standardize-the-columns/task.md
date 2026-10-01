---
description: Standardize a table's columns with tensor operations, and standardize new rows with the averages and spreads of old ones.
---

# Standardize the columns

[Standardizing the inputs](../../../../notes/04-foundations/04-neural-networks/04-inputs.md#standardizing-the-inputs) takes the average of an input away from it, and divides what's left by its spread. For a table of rides, there's an average and a spread for each column, as in [Broadcasting: standardizing the columns](../../../../notes/05-pytorch/01-tensors.md#broadcasting-standardizing-the-columns). Finish two functions:

- `standardize_like(table, new_table)` returns `new_table`, standardized with the averages and spreads of the columns of `table`: each column of `new_table` has the average of the same column of `table` taken away, and is divided by its spread. The two tables have the same columns, and any number of rows.
- `standardize(table)` standardizes a table with its own averages and spreads. It can call `standardize_like`.

The spread is the standard deviation as the lessons work it out: the average of the squared distances from the average, and then the square root. `DAY` holds the four rides of the lesson.

| Call                                                            | Returns                                                                                |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `standardize(DAY)`                                              | `tensor([[-1.3416, -1.0000], [-0.4472, 1.0000], [0.4472, 1.0000], [1.3416, -1.0000]])` |
| `standardize_like(DAY, torch.tensor([[7.0, 8.0], [3.0, 0.0]]))` | `tensor([[0.8944, 2.0000], [-0.8944, -2.0000]])`                                       |
| `standardize_like(DAY, torch.tensor([[5.0, 4.0]]))`             | `tensor([[0., 0.]])`                                                                   |

The third call is a ride with the average distance and the average waiting of `DAY`, so it comes out as 0 in both columns. The checks round the numbers to 3 decimals, because the numbers of a tensor are only exact to about 7 digits. If your numbers come out a little too small, like `-1.1619` instead of `-1.3416`, look at what `std` divides by: it's one less than the number of rides unless it's told otherwise, and the lessons divide by the number of rides.
