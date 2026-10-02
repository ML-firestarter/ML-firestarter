# A network with nn.Sequential

## How many parameters does `nn.Sequential(nn.Linear(3, 4), nn.ReLU(), nn.Linear(4, 1))` have?

- [x] 21
- [ ] 16
- [ ] 17
- [ ] 12

The first layer has 3 × 4 = 12 weights and 4 biases, 16 in all, and the second 4 × 1 = 4 weights and 1 bias, 5 more. `ReLU` has no parameters. 12 would be the weights of the first layer alone.

## What goes wrong with `nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(40, 1))`?

- [x] The first layer gives 50 numbers and the second takes 40, so the shapes don't fit
- [ ] Nothing: Sequential adjusts the sizes
- [ ] A ReLU can't go after the first layer
- [ ] The last layer must have 2 outputs

A layer's `out_features` must be the next one's `in_features`. Here 50 numbers arrive at a layer that expects 40, and the product fails with an error about shapes.

## What do three `nn.Linear` layers with no ReLU between them add up to?

- [x] One linear layer: a straight line, however many layers there are
- [ ] A network that draws any shape
- [ ] A layer that's three times as accurate
- [ ] An error: layers need a ReLU

A linear function of a linear function is linear, so the layers collapse into one, and the model can't draw a bend. The lesson's two layers with nothing between them did no better than one.

## Why are the fares standardized before the network is trained?

- [x] Near 0, like the network's first predictions, so the first steps are gentle
- [ ] A network can't take numbers above 1
- [ ] It lets the network skip standardizing the features
- [ ] It makes the fares nonnegative

The network starts from small random weights, so its first predictions are near 0, and fares around 30 give huge losses and slopes at the same learning rate. The predictions are turned back into euros with the fares' spread and average.

## What's the shape of the weight of the middle layer of `nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU(), nn.Linear(40, 1))`?

- [x] `[40, 50]`
- [ ] `[50, 40]`
- [ ] `[40, 1]`
- [ ] `[2, 50]`

A weight is `[out_features, in_features]`, and the middle layer takes 50 numbers and gives 40.
