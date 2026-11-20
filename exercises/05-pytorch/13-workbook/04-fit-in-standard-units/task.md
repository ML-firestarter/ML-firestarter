---
description: Standardize the km and the fares, train a line on them with autograd, and turn it back into euros per km and a fee.
---

# Fit in standard units

*Draws on [Tensors](../../../../notes/05-pytorch/01-tensors.md) for `mean()` and `std()`, [Autograd](../../../../notes/05-pytorch/02-autograd.md) for the training loop and [Linear regression by hand](../../../../notes/05-pytorch/04-linear-regression-by-hand.md) for fitting a line.*

Training works best when the numbers are near 0, so it's usual to standardize them first. Finish `fit_in_standard_units(km, fares, learning_rate, steps)`:

1. Standardize `km` and `fares`: subtract the mean and divide by the standard deviation, with `std(correction=0)`.
2. Train `w` and `b` of the line `w * x + b` on the standardized numbers, from 0 and 0, with `steps` steps of gradient descent and the mean squared error.
3. Turn the line back into the original units. With `x = (km - km_mean) / km_std` and `y = (fares - fares_mean) / fares_std`, the fare for `km` is `per_km * km + fee`, where `per_km = w * fares_std / km_std` and `fee = fares_mean + b * fares_std - per_km * km_mean`.
4. Return `[per_km, fee]` as plain numbers, rounded to 2 decimals.

| Call, with the day rides `km = [2, 4, 6, 8]` and `fares = [15, 23, 29, 33]` | Returns         |
| --------------------------------------------------------------------------- | --------------- |
| `fit_in_standard_units(km, fares, 0.1, 300)`                                | `[3.0, 10.0]`   |
| `fit_in_standard_units(km, fares, 0.1, 0)`                                  | `[0.0, 25.0]`   |

With no steps, the line is 0 everywhere in standard units, which is the average fare, 25, in euros. With 300 steps at a learning rate of 0.1, the training on standardized numbers has long converged to the line of the lessons, 3 per kilometer and a fee of 10.
