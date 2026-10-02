# Linear regression by hand

## `X` has the shape `[100, 3]`. What shape does `w` need for `X @ w + b` to be a prediction for each of the 100 rides?

- [x] `[3, 1]`
- [ ] `[100, 1]`
- [ ] `[1, 3]`
- [ ] `[3, 100]`

The last dimension of `X`, 3, has to be as long as the first one of `w`, so `w` has 3 rows, and one column gives one prediction for each ride: `[100, 3] @ [3, 1]` is `[100, 1]`.

## `y_pred` has the shape `[100, 1]` and `y` has the shape `[100]`. What does `((y_pred - y) ** 2).mean()` do?

- [x] It gives a number, the mean of a `[100, 100]` table, which isn't the loss
- [ ] It stops with an error about the shapes
- [ ] It gives the loss
- [ ] It gives a tensor with 100 numbers

`[100, 1]` and `[100]` broadcast into `[100, 100]`: every prediction against every fare. PyTorch is happy with that, and so the loss it gives is a number that means nothing. The labels have to be `[100, 1]`.

## Why does a loop of training not need `zero_()` on `X_std`, only on the parameters?

- [x] Only the parameters require grad, so only they collect slopes
- [ ] `X_std` is standardized, so its slopes are 0
- [ ] `zero_()` only works on tensors with one number
- [ ] The slopes of `X_std` are reset by `backward()`

Slopes are only kept for tensors that require grad: `w` and `b`. `X_std` and `y` are data, not parameters, so they have no `.grad` to reset.

## The weights found on standardized features are 10.63 and 1.20, with a spread of 3.52 for the distance. What's the weight of a kilometer?

- [x] About 3.02 per kilometer: 10.63 divided by 3.52
- [ ] About 10.63 per kilometer
- [ ] About 37.4 per kilometer: 10.63 times 3.52
- [ ] About 1.20 per kilometer

A standardized distance is $(x - m) / s$, so a step of 1 in it is a step of $s$ kilometers, and the weight on the original distance is $w / s$. 10.63 ÷ 3.52 = 3.02. Multiplying by the spread goes the wrong way.

## Why is a new ride standardized with the training rides' averages and spreads?

- [x] The weights were found on features standardized that way, so they only work on features that are
- [ ] A single ride has no average
- [ ] It makes the prediction a euro higher
- [ ] The training rides' averages are always 0

The model's numbers belong to the scale they were found on. A ride's own average is its own value, so standardizing with it would give 0 for every feature, whatever the ride.
