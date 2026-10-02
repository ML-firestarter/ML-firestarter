---
description: Train the same linear regression with nn.Linear, an optimizer and a loss function from PyTorch, and see that the numbers match the by-hand version.
---

# Linear regression with nn.Linear

[The last lesson](04-linear-regression-by-hand.md) wrote everything out: the weights, the product, the loss and the steps. Every model has the same parts, so PyTorch has a ready-made one for each, and training a model of any size looks like this lesson's, however many layers it has. Here they replace the by-hand parts, one at a time, on the same hundred rides.

## A layer for the line

`nn.Linear(in_features, out_features)` is $Xw + b$ with the parameters inside it: a weight for each pair of an input and an output, and a bias for each output. A model is called like a function, on a table of features, and it works out a prediction for every row:

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
model = nn.Linear(in_features=2, out_features=1)

print(model)
print(model.weight)
print(model.bias)
print([name for name, parameter in model.named_parameters()])
print(sum(parameter.numel() for parameter in model.parameters()))

X = torch.tensor([[0.5, -1.0], [1.5, 2.0]])
print(model(X))
```

The weights are a `Parameter`, a tensor that already `requires_grad`, so there's nothing to mark. Its shape is `[1, 2]`: `[out_features, in_features]`, the transpose of the `[2, 1]` that `w` had by hand, because the layer works out $Xw^\top + b$. The model has 3 numbers to learn: 2 weights and a bias. `model.parameters()` lists them all, which is what an optimizer needs. The numbers are random, and `manual_seed` makes them the same ones on your computer.

The `grad_fn` of the predictions is `AddmmBackward0`: a matrix product and an addition in one step, that a layer takes.

## A loss and an optimizer

`nn.MSELoss()` is the mean squared error, a function of the predictions and the labels, and `torch.optim.SGD` takes the steps of gradient descent: `step()` changes every parameter against its slope, and `zero_grad()` resets the slopes. PyTorch calls a loss function a **criterion**:

```python run
import torch
import torch.nn as nn

criterion = nn.MSELoss()
print(criterion(torch.tensor([1.0, 2.0]), torch.tensor([2.0, 4.0])))
```

The squared errors are 1 and 4, and their mean is 2.5.

## Training

To compare with the by-hand lesson, the model starts from the weights that `w` had there, and the bias from 0. The data and the standardizing are the same too. The loop has the same four steps, forward, backward, step and reset, and the two lines of the step and the reset are now one each:

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
X_std = (X - X.mean(dim=0, keepdim=True)) / X.std(dim=0, keepdim=True, correction=0)

w_start = torch.randn(2, 1)
model = nn.Linear(2, 1)
with torch.no_grad():
    model.weight.copy_(w_start.T)
    model.bias.zero_()

criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)

n_epochs = 100
for epoch in range(n_epochs):
    y_pred = model(X_std)
    loss = criterion(y_pred, y)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
    if epoch % 20 == 0 or epoch == n_epochs - 1:
        print(epoch + 1, round(loss.item(), 4))

print(model.weight)
print(model.bias)
```

The losses are the ones of the by-hand lesson, from 1147 to 0.71, and so are the weights, 10.63 and 1.20, and the bias, 31.85: the same training, with fewer lines. `model.weight.copy_(...)` copies numbers into the weights, in place, and inside `torch.no_grad()` because the weights require grad. Without it, the model would start from its own random weights, and end at the same line anyway.

## Predicting

Once the model is trained, it predicts new rides, standardized with the training rides' averages and spreads, as before. `torch.no_grad()` keeps the predictions out of the record:

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
means = X.mean(dim=0, keepdim=True)
stds = X.std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds

model = nn.Linear(2, 1)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
for epoch in range(200):
    loss = criterion(model(X_std), y)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()

new_rides = torch.tensor([[5.0, 4.0], [10.0, 0.0]])
with torch.no_grad():
    print(model((new_rides - means) / stds))
```

This model started from random weights and trained for 200 epochs, and it predicts the same fares as the by-hand one, €24.98 for 5 km with 4 minutes of waiting, and €38.34 for 10 km without any.

## Summary

- `nn.Linear(in_features, out_features)` is a layer with a weight for each input and output, and a bias for each output. Its weight has the shape `[out_features, in_features]`. A model is called on a table, and `model.parameters()` lists what it learns.
- `nn.MSELoss()` is the mean squared error, and loss functions are called criteria. `torch.optim.SGD(model.parameters(), lr=...)` takes the steps.
- The loop is forward, `loss.backward()`, `optimizer.step()` and `optimizer.zero_grad()`.
- With the same start, the same data and the same learning rate, this training gives the same numbers as the by-hand one.
- Predictions go inside `torch.no_grad()`.

## Check yourself

<details>
<summary><code>nn.Linear(5, 3)</code> has how many parameters, and what's the shape of its weight?</summary>

18 parameters: a weight for each of the 5 inputs and each of the 3 outputs, 15 in all, and a bias for each output, 3 more. The weight is `[3, 5]`: `[out_features, in_features]`.

</details>

<details>
<summary>What happens if <code>optimizer.zero_grad()</code> is left out of the loop?</summary>

The slopes pile up, as in [Slopes add up](02-autograd.md#slopes-add-up): each step uses the sum of all the slopes so far, and the training goes wrong. The optimizer doesn't reset them by itself.

</details>

<details>
<summary>Why is <code>copy_</code> inside <code>torch.no_grad()</code> in the training example?</summary>

The weights require grad, and changing a tensor that requires grad in place is an error outside of `no_grad`. Copying starting numbers into a model isn't a step of the model, so it shouldn't be recorded either.

</details>

## Your turn

In [A model with chosen weights](../../exercises/05-pytorch/05-linear-regression-with-nn-linear/01-a-model-with-chosen-weights/task.md), you'll make a layer that has the weights you give it. In [Train a model](../../exercises/05-pytorch/05-linear-regression-with-nn-linear/02-train-a-model/task.md), you'll train any model with an optimizer, and keep its losses.
