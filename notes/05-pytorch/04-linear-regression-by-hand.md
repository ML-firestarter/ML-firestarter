---
description: Train a linear regression on a hundred rides with tensors and autograd, step by step, and get back the prices on the taxi's sticker.
---

# Linear regression by hand

[Training the fare line](02-autograd.md#training-the-fare-line) fitted a line to four receipts. A real company has hundreds, and each ride has more than a distance. This lesson trains a linear regression on a hundred rides, each with two features, using only tensors and autograd: no layers and no optimizers yet. [The next lesson](05-linear-regression-with-nn-linear.md) shows what PyTorch has for the same job.

## A hundred rides

The rides are made up, but made the way the taxi's sticker would make them: €3 for every kilometer, €0.50 for every minute of waiting and €8 to start, plus a euro or so of noise that the sticker doesn't explain. A seed makes the rides the same ones every time, here and on your computer:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)

print(X.shape, y.shape)
print(X[:3])
print(y[:3])
```

`X` is the table of features, a row for each ride and a column for each feature: the distance and the minutes of waiting. `y` has the fares, and it's a table too, with a single column: shape `[100, 1]`, not `[100]`. That matters, as you'll see in a moment.

## Standardized features

Distances run up to 13 and minutes up to 10, which is close enough, but real features can be worlds apart. [Standardizing](01-tensors.md#broadcasting-standardizing-the-columns) puts them on the same scale, so one learning rate suits all the weights:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)

means = X.mean(dim=0, keepdim=True)
stds = X.std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds
print(means, stds)
print(X_std.mean(dim=0).abs() < 1e-5)
print(X_std.std(dim=0, correction=0).round(decimals=3))
```

The averages of the standardized columns are 0, up to the rounding of 32-bit numbers, and their spreads are 1.

## The model and its loss

The prediction for every ride is the dot product of its features with the weights, plus the bias: $\hat{y} = Xw + b$. `X` is `[100, 2]`, so `w` is `[2, 1]`, one weight for each feature, and the product is `[100, 1]`, one prediction for each ride. The weights start random, and the bias at 0:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
X_std = (X - X.mean(dim=0, keepdim=True)) / X.std(dim=0, keepdim=True, correction=0)

w = torch.randn(2, 1, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)

y_pred = X_std @ w + b
print(y_pred.shape)

loss = ((y_pred - y) ** 2).mean()
print(loss)

wrong = ((y_pred - y.flatten()) ** 2).mean()
print((y_pred - y.flatten()).shape, wrong)
```

The loss is the mean squared error. The last two lines show a mistake that PyTorch doesn't stop you from making. `y_pred` is `[100, 1]` and `y.flatten()` is `[100]`, and [broadcasting](01-tensors.md#broadcasting-standardizing-the-columns) makes a `[100, 100]` table out of them, every prediction against every fare. The mean of that is a number too, but it's the loss of nothing. Keep predictions and labels in the same shape: both `[100, 1]`.

## Training

The loop is the one from [Autograd](02-autograd.md#a-step-downhill): forward, backward, step inside `torch.no_grad()`, and reset. Every 20 epochs, it prints the epoch and the loss. An **epoch** is one pass over the whole training data, here a single step, since all 100 rides go in at once:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
X_std = (X - X.mean(dim=0, keepdim=True)) / X.std(dim=0, keepdim=True, correction=0)

w = torch.randn(2, 1, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)

learning_rate = 0.1
n_epochs = 100
for epoch in range(n_epochs):
    y_pred = X_std @ w + b
    loss = ((y_pred - y) ** 2).mean()
    loss.backward()
    with torch.no_grad():
        w -= learning_rate * w.grad
        b -= learning_rate * b.grad
        w.grad.zero_()
        b.grad.zero_()
    if epoch % 20 == 0 or epoch == n_epochs - 1:
        print(epoch + 1, round(loss.item(), 4))

print(w.flatten(), b)
```

The loss falls from 1147 to 0.71, and stays there. It can't reach 0, because of the noise: the rides have about 1 of it in the squared error, and a line gets the 0.71 of this sample. The weights, 10.63 and 1.20, and the bias, 31.85, don't look like the sticker, because they work on standardized features.

## Back to euros

A standardized feature is $(x - \text{mean}) / \text{std}$, so the line $w_1 \frac{x_1 - m_1}{s_1} + w_2 \frac{x_2 - m_2}{s_2} + b$ is a line in the original features too, with the weights $w_1 / s_1$ and $w_2 / s_2$, and the bias $b - w_1 m_1 / s_1 - w_2 m_2 / s_2$. In code, with tensors doing both features at once:

```python run
import torch

torch.manual_seed(42)
n = 100
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
means = X.mean(dim=0, keepdim=True)
stds = X.std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds

w = torch.randn(2, 1, requires_grad=True)
b = torch.tensor(0.0, requires_grad=True)
for epoch in range(100):
    loss = ((X_std @ w + b - y) ** 2).mean()
    loss.backward()
    with torch.no_grad():
        w -= 0.1 * w.grad
        b -= 0.1 * b.grad
        w.grad.zero_()
        b.grad.zero_()

w_eur = w.detach().flatten() / stds.flatten()
b_eur = b.item() - (w.detach().flatten() * means.flatten() / stds.flatten()).sum().item()
print(w_eur, b_eur)

new_rides = torch.tensor([[5.0, 4.0], [10.0, 0.0]])
with torch.no_grad():
    print((new_rides - means) / stds @ w + b)
```

The training found €3.02 for a kilometer, €0.44 for a minute of waiting and €8.12 to start, close to the sticker's 3, 0.5 and 8, from a hundred noisy rides. To predict new rides, they're standardized with the training rides' averages and spreads first, as [the neural network chapter](../04-foundations/04-neural-networks/04-inputs.md#new-orders) says, and `torch.no_grad()` keeps the prediction out of the record.

## Summary

- A linear regression on a table is $\hat{y} = Xw + b$: `X` is `[n, features]`, `w` is `[features, 1]`, and the predictions are `[n, 1]`.
- Keep the labels in the shape of the predictions, `[n, 1]`. With `[n]`, broadcasting makes a `[n, n]` loss of nothing, with no error.
- Standardize the features with the training data's averages and spreads, and standardize new rides the same way.
- The loop is forward, backward, step inside `torch.no_grad()`, and reset. An epoch is one pass over the training data.
- Weights found on standardized features turn back into weights on the original ones by dividing by the spread.

## Check yourself

<details>
<summary>The weights are <code>[2, 1]</code> and <code>X</code> is <code>[50, 2]</code>. What shape is <code>X @ w + b</code>?</summary>

`[50, 1]`: the product has a row for each of the 50 rows of `X` and a column for the single column of `w`, and the bias, a single number, is added to every one.

</details>

<details>
<summary>The loss goes down to 0.71 and not to 0. Is something wrong?</summary>

No. The fares have noise that no line explains, so even the best line misses by about a euro. A loss of exactly 0 would be a reason to worry: it would mean that the line had learned the noise.

</details>

<details>
<summary>Why is a new ride standardized with the training rides' averages and not its own?</summary>

The weights were found on features with the training rides' averages and spreads, so they only work on features that are standardized the same way. A single ride's own average is itself, and it would always come out as 0.

</details>

## Your turn

In [Predict and score](../../exercises/05-pytorch/04-linear-regression-by-hand/01-predict-and-score/task.md), you'll work out the predictions and the loss for any weights. In [Fit a line](../../exercises/05-pytorch/04-linear-regression-by-hand/02-fit-a-line/task.md), you'll train a linear regression on any table of features.
