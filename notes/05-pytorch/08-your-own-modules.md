---
description: Write your own nn.Module with a wide path and a deep one, feed it columns, two inputs or named inputs, and give it a second output.
---

# Your own modules

`nn.Sequential` passes data down a single line of layers, and some networks aren't a line. In a **wide and deep** network, the inputs go through a stack of layers, the deep path, *and* straight to the output layer, the wide path, which sees them as they are. The deep path can learn bends and patterns, and the wide one carries simple rules past all those transformations, where a plain stack might smudge them:

```text
inputs ──► deep stack (Linear, ReLU, Linear, ReLU) ──┐
   │                                                 ├──► concatenate ──► output layer ──► fare
   └─────────────────────────────────────────────────┘
```

That needs a module of your own, and a module is a class, as in the lesson on [classes](../02-python/04-programs/01-classes.md). This lesson builds one, and then gives it other things to take and to return: columns of one table, two inputs, named inputs and two outputs. The taxi company's rides get a third feature, `night`, for rides at night, which add €3 to the fare.

## A module of your own

A model is a subclass of `nn.Module`. Its `__init__` calls `super().__init__()` first, and then makes its layers and keeps them as attributes of `self`. Its `forward` says how an input becomes an output. `torch.cat([a, b], dim=1)` joins the features of the input and the numbers the deep path made, side by side:

```python run
import torch

wide = torch.zeros(5, 3)
deep = torch.ones(5, 40)
print(torch.cat([wide, deep], dim=1).shape)
print(torch.cat([wide, wide], dim=0).shape)
```

`dim=1` joins columns, so the rows must match and the columns add up: 3 + 40 = 43. `dim=0` would stack rows. Here's the whole module, for a table of any number of features:

```python run
import torch
import torch.nn as nn


class WideAndDeep(nn.Module):
    def __init__(self, n_features):
        super().__init__()
        self.deep_stack = nn.Sequential(
            nn.Linear(n_features, 50),
            nn.ReLU(),
            nn.Linear(50, 40),
            nn.ReLU(),
        )
        self.output_layer = nn.Linear(n_features + 40, 1)

    def forward(self, X):
        deep_output = self.deep_stack(X)
        return self.output_layer(torch.cat([X, deep_output], dim=1))


torch.manual_seed(42)
model = WideAndDeep(3)
print(model)
print(model.output_layer)
print(sum(parameter.numel() for parameter in model.parameters()))
print(model(torch.randn(5, 3)).shape)
```

Printing a model shows its layers as a tree, with the names of the attributes they were kept under. `model.output_layer` is one of them. The parameters of the layers inside `deep_stack` count as the module's too: 3 × 50 + 50, 50 × 40 + 40 and 43 + 1 add up to the 2,284 you see, and `model.parameters()` is what an optimizer takes.

`model(X)` isn't a call of `forward` that you wrote: `nn.Module` has a `__call__` that runs `forward`, as in the toy `Module` of the Classes lesson, and it does a few things more around it. Call the model, and not `model.forward(X)`.

A layer has to be an attribute for the module to know about it, because `nn.Module` watches what's assigned to `self`. A layer hidden in a Python list is missed, and so are its parameters, and an optimizer given `model.parameters()` would never train them:

```python run
import torch.nn as nn


class Hidden(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = [nn.Linear(2, 3), nn.Linear(3, 1)]


class Visible(nn.Module):
    def __init__(self):
        super().__init__()
        self.first = nn.Linear(2, 3)
        self.second = nn.Linear(3, 1)


print(len(list(Hidden().parameters())))
print(len(list(Visible().parameters())))
```

## Training it

A model of your own trains like any other. `train` and `rmse_in_euros` here are the ones of [lesson 7](07-a-network-with-nn-sequential.md), and the data is the same rides with the added `night` feature. The plain network of that lesson is trained next to the wide and deep one, the same number of epochs, and each is scored on the validation rides:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
night = (torch.rand(n, 1) > 0.7).float()
X = torch.cat([km, minutes, night], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 3 * night + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)


class WideAndDeep(nn.Module):
    def __init__(self, n_features):
        super().__init__()
        self.deep_stack = nn.Sequential(
            nn.Linear(n_features, 50),
            nn.ReLU(),
            nn.Linear(50, 40),
            nn.ReLU(),
        )
        self.output_layer = nn.Linear(n_features + 40, 1)

    def forward(self, X):
        deep_output = self.deep_stack(X)
        return self.output_layer(torch.cat([X, deep_output], dim=1))


def train(model, learning_rate=0.05, n_epochs=30):
    criterion = nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    for epoch in range(n_epochs):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()


def rmse_in_euros(model):
    model.eval()
    with torch.no_grad():
        return round((((model(X_valid) - y_valid) ** 2).mean().sqrt() * y_std).item(), 2)


torch.manual_seed(42)
network = nn.Sequential(nn.Linear(3, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU(), nn.Linear(40, 1))
wide_and_deep = WideAndDeep(3)
for name, model in [("network", network), ("wide and deep", wide_and_deep)]:
    train(model)
    print(name, rmse_in_euros(model))
```

The two come out about the same, €1.06 and €1.10, with the noise in the fares at €1. The wide path doesn't make this problem easier, because a plain stack does well on three features. It earns its place when there are many features, or some of them are rules worked out by hand that a stack of layers shouldn't blur.

## Different columns for each path

What if each path should see other columns? The wide path could take `minutes` and `night`, simple effects that a straight line captures, and the deep path `km` and `minutes`, where the bend is. One way is to do the cutting in `forward`, with slices. `X[:, :2]` is all the rows and the first two columns, and `X[:, 1:]` all the rows and the columns from the second on. The two can overlap, as `minutes` does:

```python run
import torch
import torch.nn as nn

X = torch.tensor([[2.0, 5.0, 0.0], [8.0, 3.0, 1.0]])
print(X[:, :2])
print(X[:, 1:])


class WideAndDeep(nn.Module):
    def __init__(self):
        super().__init__()
        self.deep_stack = nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU())
        self.output_layer = nn.Linear(2 + 40, 1)

    def forward(self, X):
        X_wide = X[:, 1:]
        X_deep = X[:, :2]
        deep_output = self.deep_stack(X_deep)
        return self.output_layer(torch.cat([X_wide, deep_output], dim=1))


torch.manual_seed(42)
print(WideAndDeep()(X).shape)
```

That's fine, but it ties the module to one order of columns. It's usually better to let the model take what each path needs as separate tensors.

## Two inputs

A `forward` can take more than one argument. The table of features is cut once, outside, and the model is called with both pieces. That also covers inputs that can't be put in one tensor at all, like an image and a text, with different numbers of dimensions. `TensorDataset` takes any number of tensors, and so a `DataLoader` made from it gives that many, in the same order, for every batch:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
night = (torch.rand(n, 1) > 0.7).float()
X = torch.cat([km, minutes, night], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 3 * night + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
X_wide_train, X_deep_train = X_train[:, 1:], X_train[:, :2]
X_wide_valid, X_deep_valid = X_valid[:, 1:], X_valid[:, :2]
train_loader = DataLoader(TensorDataset(X_wide_train, X_deep_train, y_train), batch_size=32, shuffle=True)
print([tuple(tensor.shape) for tensor in next(iter(train_loader))])


class WideAndDeep(nn.Module):
    def __init__(self, n_wide, n_deep):
        super().__init__()
        self.deep_stack = nn.Sequential(nn.Linear(n_deep, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU())
        self.output_layer = nn.Linear(n_wide + 40, 1)

    def forward(self, X_wide, X_deep):
        deep_output = self.deep_stack(X_deep)
        return self.output_layer(torch.cat([X_wide, deep_output], dim=1))


torch.manual_seed(42)
model = WideAndDeep(n_wide=2, n_deep=2)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

for epoch in range(30):
    model.train()
    for X_wide_batch, X_deep_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_wide_batch, X_deep_batch), y_batch).backward()
        optimizer.step()

model.eval()
with torch.no_grad():
    prediction = model(X_wide_valid, X_deep_valid)
print(round((((prediction - y_valid) ** 2).mean().sqrt() * y_std).item(), 2))
```

The loop takes the batch apart into its three tensors and gives the first two to the model in the order of `forward`'s arguments. Unpacking by position works, but with more inputs it's easy to mix up the order. The result, €1.02, is as close to the noise of the fares as the models before it.

## Named inputs

A `Dataset` of your own can name the inputs. It's a class with three methods: `__init__` to keep the data, `__len__` for how many items there are, and `__getitem__` for the item at an index, as `dataset[0]` calls it. Here an item is a dictionary of the inputs, and the label:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
night = (torch.rand(n, 1) > 0.7).float()
X = torch.cat([km, minutes, night], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 3 * night + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
X_wide_train, X_deep_train = X_train[:, 1:], X_train[:, :2]
X_wide_valid, X_deep_valid = X_valid[:, 1:], X_valid[:, :2]


class RideDataset(Dataset):
    def __init__(self, X_wide, X_deep, y):
        self.X_wide = X_wide
        self.X_deep = X_deep
        self.y = y

    def __len__(self):
        return len(self.y)

    def __getitem__(self, index):
        inputs = {"X_wide": self.X_wide[index], "X_deep": self.X_deep[index]}
        return inputs, self.y[index]


dataset = RideDataset(X_wide_train, X_deep_train, y_train)
print(len(dataset))
print(dataset[0])

train_loader = DataLoader(dataset, batch_size=32, shuffle=True)
inputs, y_batch = next(iter(train_loader))
print({name: tuple(tensor.shape) for name, tensor in inputs.items()}, tuple(y_batch.shape))


class WideAndDeep(nn.Module):
    def __init__(self, n_wide, n_deep):
        super().__init__()
        self.deep_stack = nn.Sequential(nn.Linear(n_deep, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU())
        self.output_layer = nn.Linear(n_wide + 40, 1)

    def forward(self, X_wide, X_deep):
        deep_output = self.deep_stack(X_deep)
        return self.output_layer(torch.cat([X_wide, deep_output], dim=1))


torch.manual_seed(42)
model = WideAndDeep(n_wide=2, n_deep=2)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

for epoch in range(30):
    model.train()
    for inputs, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(**inputs), y_batch).backward()
        optimizer.step()

model.eval()
with torch.no_grad():
    prediction = model(X_wide=X_wide_valid, X_deep=X_deep_valid)
print(round((((prediction - y_valid) ** 2).mean().sqrt() * y_std).item(), 2))
```

A `DataLoader` batches dictionaries as it batches tensors: it gives a dictionary with the same names, each holding a batch of tensors. `model(**inputs)` spreads a dictionary into keyword arguments, `model(X_wide=..., X_deep=...)`, so the order stops mattering. What does matter is that the names are the names of `forward`'s parameters, and a wrong one fails with a `TypeError`:

```python run
import torch
import torch.nn as nn


class Adder(nn.Module):
    def forward(self, X_wide, X_deep):
        return X_wide + X_deep


print(Adder()(X_wide=torch.ones(2), X_deep=torch.ones(2)))
print(Adder()(X_wide=torch.ones(2), X_other=torch.ones(2)))
```

## Two outputs

A model can return more than one value, and `forward` just returns them together, as a tuple. A second output is useful for two tasks sharing one body, or, as here, as a **helper output** on the deep path. `aux_layer` makes a prediction from the deep stack alone, and its error is added to the loss with a weight, so that the deep stack has to learn something useful by itself, whatever the wide path does. At the end, only the main output is the model's answer:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
night = (torch.rand(n, 1) > 0.7).float()
X = torch.cat([km, minutes, night], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 3 * night + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
X_wide_train, X_deep_train = X_train[:, 1:], X_train[:, :2]
X_wide_valid, X_deep_valid = X_valid[:, 1:], X_valid[:, :2]
train_loader = DataLoader(TensorDataset(X_wide_train, X_deep_train, y_train), batch_size=32, shuffle=True)


class WideAndDeep(nn.Module):
    def __init__(self, n_wide, n_deep):
        super().__init__()
        self.deep_stack = nn.Sequential(nn.Linear(n_deep, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU())
        self.output_layer = nn.Linear(n_wide + 40, 1)
        self.aux_layer = nn.Linear(40, 1)

    def forward(self, X_wide, X_deep):
        deep_output = self.deep_stack(X_deep)
        main_output = self.output_layer(torch.cat([X_wide, deep_output], dim=1))
        aux_output = self.aux_layer(deep_output)
        return main_output, aux_output


torch.manual_seed(42)
model = WideAndDeep(n_wide=2, n_deep=2)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
aux_weight = 0.2

for epoch in range(30):
    model.train()
    for X_wide_batch, X_deep_batch, y_batch in train_loader:
        optimizer.zero_grad()
        main_output, aux_output = model(X_wide_batch, X_deep_batch)
        loss = criterion(main_output, y_batch) + aux_weight * criterion(aux_output, y_batch)
        loss.backward()
        optimizer.step()

model.eval()
with torch.no_grad():
    main_output, aux_output = model(X_wide_valid, X_deep_valid)
for name, output in [("main", main_output), ("aux", aux_output)]:
    print(name, round((((output - y_valid) ** 2).mean().sqrt() * y_std).item(), 2))
```

The main output is off by €1.00, as good as the model without a helper. The helper reaches €1.61: it never sees `night`, which adds up to €3 to a fare, so it can't be better. The loss is the sum of two parts, and `loss.backward()` sends slopes back through both paths at once, as it does for any computation.

## Summary

- A model of your own is a subclass of `nn.Module`. `__init__` calls `super().__init__()` and keeps the layers as attributes of `self`, and `forward` says how the inputs become an output. Call the model, as in `model(X)`, and not `forward`.
- Layers and their parameters are found through the attributes of `self`: a layer in a plain list is missed.
- `torch.cat([a, b], dim=1)` joins tensors side by side, which is how a wide path and a deep one meet before the output layer.
- A `forward` can take several tensors. A `TensorDataset` gives them from a `DataLoader` in order, and a `Dataset` of your own with `__len__` and `__getitem__` can give them by name, which `model(**inputs)` passes on.
- A `forward` can return several values, and the loss decides what each one is worth.

## Check yourself

<details>
<summary>What does <code>super().__init__()</code> do in a model's <code>__init__</code>?</summary>

It runs the `__init__` of `nn.Module`, which sets up what the module needs to keep track of its layers and parameters. It goes first, before any layer is assigned. Without it, the first assignment of a layer fails with an `AttributeError`.

</details>

<details>
<summary>The deep path of a model has 40 outputs and its wide path takes 2 columns. What are the <code>in_features</code> of the output layer?</summary>

42. `torch.cat([X_wide, deep_output], dim=1)` puts the 2 columns next to the 40 outputs, so the output layer takes 2 + 40 numbers for every row.

</details>

<details>
<summary>Why does <code>model(**inputs)</code> fail for <code>inputs = {"X_wide": ..., "X_other": ...}</code> when <code>forward(self, X_wide, X_deep)</code>?</summary>

`**inputs` passes each key as the name of an argument, so this is `model(X_wide=..., X_other=...)`. `forward` has no parameter called `X_other`, and it never gets `X_deep`, so Python stops with a `TypeError`. The keys have to be the names of `forward`'s parameters.

</details>

## Your turn

In [A wide and deep model](../../exercises/05-pytorch/08-your-own-modules/01-a-wide-and-deep-model/task.md), you'll write the module, with the layers where the lesson put them. In [Train with a helper output](../../exercises/05-pytorch/08-your-own-modules/02-train-with-a-helper-output/task.md), you'll write the training epoch of a model with two inputs and two outputs.
