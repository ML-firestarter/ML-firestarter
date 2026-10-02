---
description: Stack layers with nn.Sequential and ReLU into a neural network, train it on fares that no straight line fits, and count its parameters.
---

# A network with nn.Sequential

A linear regression can only draw a straight line, or a flat plane for more features. Fares don't have to follow one: say the taxi charges €4 for each of the first 6 kilometers of a ride and only €2 for each kilometer after them. [Neural networks](../04-foundations/04-neural-networks/) draw the bends, and PyTorch builds one out of the layers of the [last lessons](05-linear-regression-with-nn-linear.md) stacked in `nn.Sequential`.

## Stacking layers

`nn.Sequential` takes layers and calls them one after another, the output of each going into the next. Between two `nn.Linear` layers goes an activation function, here the `nn.ReLU()` of [the neural network chapter](../04-foundations/04-neural-networks/01-layers.md#relu). The sizes have to meet: a layer's `out_features` is the next one's `in_features`.

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
model = nn.Sequential(
    nn.Linear(2, 50),
    nn.ReLU(),
    nn.Linear(50, 40),
    nn.ReLU(),
    nn.Linear(40, 1),
)

print(model)
print(model[0], len(model))
print([tuple(parameter.shape) for parameter in model.parameters()])
print(sum(parameter.numel() for parameter in model.parameters()))
print(model(torch.randn(3, 2)).shape)
```

The network takes 2 features, widens them into 50 numbers, and then 40, and ends with 1, the fare. Its layers are numbered, and `model[0]` is the first. `ReLU` has no parameters, so the six tensors are the weights and biases of the three layers. They add up to 2,231 numbers to learn: 2 × 50 + 50, 50 × 40 + 40 and 40 × 1 + 1. Whatever the number of rows that goes in, one fare comes out for each of them.

## Why the ReLU

Without the ReLUs, the layers would add up to a single line, because a linear function of a linear function is linear. [The first network](../04-foundations/04-neural-networks/01-layers.md#why-the-activation-matters) of the neural network chapter says why in numbers, and training shows it. Here are a plain linear regression, two `nn.Linear` layers with nothing between them, and the network with ReLUs, trained on the same fares:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 8 + torch.randn(n, 1)

X_train, y_train, X_valid, y_valid = X[:600], y[:600], X[600:], y[600:]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
X_train, X_valid = (X_train - x_mean) / x_std, (X_valid - x_mean) / x_std
y_train, y_valid = (y_train - y_mean) / y_std, (y_valid - y_mean) / y_std
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)


def train(model, learning_rate=0.05, n_epochs=40):
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
linear = nn.Linear(2, 1)
two_linear = nn.Sequential(nn.Linear(2, 50), nn.Linear(50, 1))
network = nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU(), nn.Linear(40, 1))
for name, model in [("linear", linear), ("two linear layers", two_linear), ("network with ReLUs", network)]:
    train(model)
    print(name, rmse_in_euros(model))
```

The line misses by about €1.88, and the two layers without a ReLU, with 50 times the parameters, do no better: €2.04. The network with ReLUs is off by about €1.07, and the noise in the fares is €1, so it can't do much better than that. The numbers are the root of the mean squared error on the 200 validation rides, in euros.

## Training the network

There was one change from the last lessons that matters. The **labels are standardized too**, like the features, and the RMSE is turned back into euros at the end by multiplying by the spread of the fares. A network starts from small random weights, so its first predictions are close to 0, and fares of about 30 would make its first steps huge: the training would bounce around, or blow up. With labels around 0, the same learning rate is gentle.

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 800
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 4 * km.clamp(max=6) + 2 * (km - 6).clamp(min=0) + 0.5 * minutes + 8 + torch.randn(n, 1)

X_train, y_train = X[:600], y[:600]
x_mean, x_std = X_train.mean(dim=0, keepdim=True), X_train.std(dim=0, keepdim=True, correction=0)
y_mean, y_std = y_train.mean(), y_train.std(correction=0)
train_loader = DataLoader(TensorDataset((X_train - x_mean) / x_std, (y_train - y_mean) / y_std), batch_size=32, shuffle=True)

torch.manual_seed(42)
model = nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU(), nn.Linear(40, 1))
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

n_epochs = 40
for epoch in range(n_epochs):
    model.train()
    total_loss = 0.0
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        loss = criterion(model(X_batch), y_batch)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    if epoch % 10 == 9 or epoch == 0:
        print(epoch + 1, round(total_loss / len(train_loader), 4))

new_rides = torch.tensor([[3.0, 0.0], [6.0, 0.0], [12.0, 0.0]])
model.eval()
with torch.no_grad():
    fares = model((new_rides - x_mean) / x_std) * y_std + y_mean
print(fares.flatten())
```

The loss is in standardized units, so 0.0098 is a hundredth of the fares' variance. The last lines predict three rides with no waiting: 3, 6 and 12 km. This taxi's sticker gives 8 + 4 × 3 = 20, 8 + 4 × 6 = 32 and 8 + 4 × 6 + 2 × 6 = 44 for them, and the network says 19.9, 31.3 and 43.5. A prediction is turned back into euros the way the labels were turned: times the spread, plus the average. A straight line can't get the bend at 6 km right, and the network does.

## Summary

- `nn.Sequential(layer, layer, ...)` calls its layers one after another. A layer's output size is the next one's input size, and `model[0]` is the first layer.
- Layers need an activation function between them, usually `nn.ReLU()`. Without it, any number of linear layers is one linear layer.
- A network's parameters are the weights and biases of its layers, and `sum(p.numel() for p in model.parameters())` counts them.
- Standardize the labels too, when they're far from 0, and turn predictions back into the original units.

## Check yourself

<details>
<summary>How many parameters does <code>nn.Sequential(nn.Linear(3, 4), nn.ReLU(), nn.Linear(4, 1))</code> have?</summary>

21: the first layer has 3 × 4 weights and 4 biases, 16 in all, and the second has 4 × 1 weights and 1 bias, 5 more. `ReLU` has none.

</details>

<details>
<summary>What goes wrong with <code>nn.Sequential(nn.Linear(2, 50), nn.Linear(40, 1))</code>?</summary>

The first layer gives 50 numbers for every row, and the second takes 40, so the first call fails with an error about shapes that can't be multiplied. The sizes have to meet: the second layer must be `nn.Linear(50, 1)`.

</details>

<details>
<summary>Why do the fares get standardized before training the network?</summary>

The network's first predictions are near 0, and fares around 30 make the first losses and slopes huge, so the same learning rate can make the training jump around. Standardized fares are near 0 too, and training is gentle. The predictions are turned back into euros afterwards.

</details>

## Your turn

In [Build a network](../../exercises/05-pytorch/07-a-network-with-nn-sequential/01-build-a-network/task.md), you'll make a network from a list of layer sizes. In [Count the parameters](../../exercises/05-pytorch/07-a-network-with-nn-sequential/02-count-the-parameters/task.md), you'll count what a model has to learn, and list the shapes of its layers.
