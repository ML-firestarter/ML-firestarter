# Your own modules

## A module's `__init__` does `self.layers = [nn.Linear(2, 3), nn.Linear(3, 1)]`. What does `model.parameters()` give?

- [x] Nothing: the layers are in a plain list, so the module doesn't know about them
- [ ] The weights and biases of both layers
- [ ] Only the first layer's weights and bias
- [ ] An error, because a module can't hold a list

`nn.Module` finds layers and parameters through the attributes assigned to `self`. A list is a plain Python object, so the layers inside it are missed, and an optimizer would never train them. Each layer needs an attribute of its own.

## What's the shape of `torch.cat([a, b], dim=1)` when `a` has the shape `[8, 2]` and `b` has `[8, 40]`?

- [x] `[8, 42]`
- [ ] `[16, 40]`
- [ ] `[8, 80]`
- [ ] An error: the shapes differ

`dim=1` joins the columns side by side, so the rows have to match, and the columns add up: 2 + 40 = 42. `dim=0` would stack the rows, and then the columns would have to match.

## Why is a model called as `model(X)`, and not as `model.forward(X)`?

- [x] `model(X)` runs `forward` and does what `nn.Module` needs around it
- [ ] `forward` can't be called by hand
- [ ] `model(X)` is the only way to train the model
- [ ] `model(X)` makes `forward` run on the GPU

`nn.Module` has a `__call__` that runs `forward`, so a model can be called like a function, and that call also does a few things more around it. `model.forward(X)` gives the same output but skips them.

## What does `model(**inputs)` do for `inputs = {"X_wide": a, "X_deep": b}`?

- [x] It calls `model(X_wide=a, X_deep=b)`
- [ ] It calls `model(a, b)` in the order of the dictionary's values, whatever the names are
- [ ] It calls `model(inputs)` with the dictionary as the only argument
- [ ] It multiplies the two tensors

`**` spreads a dictionary into keyword arguments, with the keys as the names of the parameters. They have to be the names in `forward`'s signature, and a name that isn't there fails with a `TypeError`.

## A wide path takes 3 columns, and a deep stack ends in 16 numbers. What's `in_features` of the output layer that takes both?

- [x] 19
- [ ] 16
- [ ] 48
- [ ] 3

`torch.cat([X_wide, deep_output], dim=1)` puts the 3 columns next to the 16 numbers, so the output layer takes 3 + 16 = 19 numbers for each row.

## A model returns `main_output, aux_output`. How can both help train it?

- [x] The loss adds the main error and a weighted error of the helper output
- [ ] Only the main output can have a loss
- [ ] The two outputs have to be averaged before the loss
- [ ] The helper output replaces the main one after training

`forward` can return several values, and the loss is whatever combination of them you write, like `criterion(main, y) + 0.2 * criterion(aux, y)`. `backward()` sends slopes through every path that led to it. The helper output pushes the deep stack to learn something useful on its own, and only the main output is used to predict.
