---
description: Feed a model its data a few rows at a time with Dataset and DataLoader, split rides into training, validation and test sets, and evaluate a model with a metric.
---

# Batches and evaluation

Training on a hundred rides at once was easy. Training on a million of them at once means a table that doesn't fit in memory, and one step of gradient descent for each pass over it, which is very slow. So real training works on a **batch** of a few dozen rows at a time, and takes a step for each batch. This lesson makes the batches with PyTorch's `Dataset` and `DataLoader`, splits the rides into three sets, trains a model one batch at a time, and measures how good it is.

## Batches

A `TensorDataset` holds tensors with a row for each example, here the features and the fare of every ride, and gives one example at a time. A `DataLoader` takes a dataset and gives it in batches, in a new random order every epoch when it's told `shuffle=True`. The seed fixes the order, here and on your computer:

```python run
import torch
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(42)
n = 1000
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)

dataset = TensorDataset(X, y)
print(len(dataset))
print(dataset[0])

loader = DataLoader(dataset, batch_size=32, shuffle=True)
print(len(loader))
for i, (X_batch, y_batch) in enumerate(loader):
    if i < 2 or i == len(loader) - 1:
        print(i, X_batch.shape, y_batch.shape)
```

`dataset[0]` is the first ride: its two features and its fare. The loader has 32 batches: 31 of 32 rides, and a last one with the 8 that are left. Each batch is a pair, the features of its rides and their fares, and a loop can unpack them: `for X_batch, y_batch in loader`.

## Three sets of rides

A model that's measured on the rides it learned from looks better than it is, so the rides are split in three. The **training set** is what the model learns from, the **validation set** is what you measure it on while you choose its settings, and the **test set** is kept for the end, to measure the model you picked once. `random_split` cuts a dataset into random parts of the sizes you give, and a generator with a seed makes the cut the same every time:

```python run
import torch
from torch.utils.data import DataLoader, TensorDataset, random_split

torch.manual_seed(42)
n = 1000
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)

train_set, valid_set, test_set = random_split(
    TensorDataset(X, y), [600, 200, 200], generator=torch.Generator().manual_seed(1)
)
print(len(train_set), len(valid_set), len(test_set))
print(train_set.indices[:5])

means = X[train_set.indices].mean(dim=0, keepdim=True)
stds = X[train_set.indices].std(dim=0, keepdim=True, correction=0)
print(means, stds)
```

The averages and spreads for [standardizing](04-linear-regression-by-hand.md#standardized-features) come from the training rides only, and the validation and test rides are standardized with them, as [the neural network chapter](../04-foundations/04-neural-networks/04-inputs.md#new-orders) says. The test rides must not leak into anything the model, or you, learn from.

## An epoch

The loop of four steps now has a loop inside it: an epoch goes through all the batches of the training set, and every batch is a step. The loss that's printed is the mean of the batch losses. `model.train()` says that the model is being trained, which matters for layers that behave differently in training than in use, and it costs nothing here:

```python run
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset, random_split

torch.manual_seed(42)
n = 1000
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
train_set, valid_set, test_set = random_split(
    TensorDataset(X, y), [600, 200, 200], generator=torch.Generator().manual_seed(1)
)
means = X[train_set.indices].mean(dim=0, keepdim=True)
stds = X[train_set.indices].std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds
train_loader = DataLoader(TensorDataset(X_std[train_set.indices], y[train_set.indices]), batch_size=32, shuffle=True)

model = nn.Linear(2, 1)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)

for epoch in range(5):
    model.train()
    total_loss = 0.0
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        loss = criterion(model(X_batch), y_batch)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()
    print(epoch + 1, round(total_loss / len(train_loader), 3))
```

The loss falls from 291 to about 1 in three epochs, a lot faster than the 100 epochs of [the by-hand lesson](04-linear-regression-by-hand.md#training): an epoch is now 19 steps, not 1. `loss.item()` gives the loss as a plain number, and adding tensors that still remember their record would keep every batch's graph in memory.

## Evaluating

To measure a model, it goes in evaluation mode, `model.eval()`, and the predictions are worked out inside `torch.no_grad()`, since nothing will go backwards through them. A metric is a number that says how good the predictions are, and for fares, the **RMSE**, the square root of the mean squared error, is in euros, which is easy to read. But what to average over matters: the mean of each batch's RMSE isn't the RMSE of all the rides, when the last batch is smaller. `torchmetrics` has the metrics as objects that collect a batch at a time: `update` for every batch, and `compute` at the end:

```python run
import torch
import torch.nn as nn
import torchmetrics
from torch.utils.data import DataLoader, TensorDataset, random_split

torch.manual_seed(42)
n = 1000
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)
train_set, valid_set, test_set = random_split(
    TensorDataset(X, y), [600, 200, 200], generator=torch.Generator().manual_seed(1)
)
means = X[train_set.indices].mean(dim=0, keepdim=True)
stds = X[train_set.indices].std(dim=0, keepdim=True, correction=0)
X_std = (X - means) / stds
train_loader = DataLoader(TensorDataset(X_std[train_set.indices], y[train_set.indices]), batch_size=32, shuffle=True)
valid_loader = DataLoader(TensorDataset(X_std[valid_set.indices], y[valid_set.indices]), batch_size=32)

model = nn.Linear(2, 1)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
for epoch in range(5):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()

model.eval()
squared_errors = 0.0
batch_rmses = []
rmse = torchmetrics.MeanSquaredError(squared=False)
with torch.no_grad():
    for X_batch, y_batch in valid_loader:
        y_pred = model(X_batch)
        squared_errors += ((y_pred - y_batch) ** 2).sum().item()
        batch_rmses.append(((y_pred - y_batch) ** 2).mean().sqrt())
        rmse.update(y_pred, y_batch)

print(round((squared_errors / len(valid_set)) ** 0.5, 4))
print(round(torch.stack(batch_rmses).mean().item(), 4))
print(rmse.compute())
```

The RMSE over the 200 validation rides is 1.0124: add up the squared errors of all the rides, divide by their number, take the root. The mean of the seven batches' RMSEs is 0.9922, a little off, because the last batch has only 8 rides and counts as much as the others. `torchmetrics` gets it right, 1.0124, and the model is off by about a euro, which is the noise in the fares. The loops of this lesson, one epoch and one evaluation, are what a trainer is made of, and the exercises write them as functions.

## Summary

- A `TensorDataset` holds tensors with a row for each example, and a `DataLoader` gives them in batches, shuffled for training. A step of gradient descent is taken for every batch, and an epoch goes through all of them.
- Rides are split in a training set to learn from, a validation set to measure on while choosing, and a test set that's kept to the end. `random_split` cuts a dataset, and standardizing uses the training set's averages and spreads only.
- Evaluate with `model.eval()` and `torch.no_grad()`. A metric over all the rides isn't the mean of the metrics of the batches, when the last batch is smaller.
- `torchmetrics` metrics collect batches with `update` and give the result with `compute`.

## Check yourself

<details>
<summary>1,000 rides go in batches of 32. How many batches does the loader have, and how big is the last?</summary>

32 batches: 31 full ones, which is 992 rides, and a last one with the 8 that are left. `DataLoader` keeps a last batch that's smaller, unless it's told `drop_last=True`.

</details>

<details>
<summary>Why does the model get only the training rides' averages and spreads for standardizing?</summary>

Standardizing is part of the model, so what goes into it must come from what the model may learn from. Averages that include the validation or test rides would let them leak into the model, and its scores would look better than they are.

</details>

<details>
<summary>Why <code>loss.item()</code> and not <code>total_loss += loss</code>?</summary>

`loss` is a tensor with a record of its whole batch's computation, and adding it keeps that record alive for every batch of the epoch, which fills the memory for nothing. `.item()` takes out the number and lets the record go.

</details>

## Your turn

In [Train one epoch](../../exercises/05-pytorch/06-batches-and-evaluation/01-train-one-epoch/task.md), you'll write the loop over the batches of an epoch. In [Evaluate the RMSE](../../exercises/05-pytorch/06-batches-and-evaluation/02-evaluate-the-rmse/task.md), you'll measure a model over all the batches of a loader, the right way.
