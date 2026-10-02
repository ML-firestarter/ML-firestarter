---
description: Save a trained model's weights with the settings that built it, load them into a new model, and search for a learning rate and a layer size that work well.
---

# Saving, loading and tuning

A model that took an hour to train is worth keeping, and so is the knowledge of which settings trained it best. This lesson saves a model and loads it back, then tries out several settings of the network from [the last lesson](09-classifying-images.md) and keeps the best.

## Saving a model

A model's learned numbers are in its **state dict**: a dictionary of the weights and biases, by the names of their layers. `torch.save` writes any such dictionary to a file, and `torch.load` reads it back. A model can't be built from its weights alone, because they don't say how many layers there are or how wide, so the file also holds the **hyperparameters** that the model was made with: the settings that you choose, as opposed to the weights that training finds.

Here a network is trained for 5 epochs, saved into a checkpoint and loaded back into a new model. The checkpoint goes into memory here, with `io.BytesIO`, and into a file, `digits.pt`, which is the same thing on a computer:

```python run
import io
import torch
import torch.nn as nn
import torchmetrics
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
valid_loader = DataLoader(valid_set, batch_size=64)


def make_model(n_inputs, n_hidden, n_classes):
    return nn.Sequential(
        nn.Flatten(),
        nn.Linear(n_inputs, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_classes),
    )


def train(model, learning_rate, n_epochs):
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    for epoch in range(n_epochs):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()


def accuracy(model):
    metric = torchmetrics.Accuracy(task="multiclass", num_classes=10)
    model.eval()
    with torch.no_grad():
        for X_batch, y_batch in valid_loader:
            metric.update(model(X_batch), y_batch)
    return round(metric.compute().item(), 4)


torch.manual_seed(42)
hyperparameters = {"n_inputs": 64, "n_hidden": 50, "n_classes": 10}
model = make_model(**hyperparameters)
train(model, 0.1, 5)
print(accuracy(model))
print({name: tuple(weights.shape) for name, weights in model.state_dict().items()})

checkpoint = {"model_state_dict": model.state_dict(), "hyperparameters": hyperparameters}
buffer = io.BytesIO()
torch.save(checkpoint, buffer)
torch.save(checkpoint, "digits.pt")

buffer.seek(0)
loaded = torch.load(buffer, weights_only=True)
print(loaded.keys())
print(loaded["hyperparameters"])

new_model = make_model(**loaded["hyperparameters"])
print(accuracy(new_model))
new_model.load_state_dict(loaded["model_state_dict"])
print(accuracy(new_model))

with torch.no_grad():
    print(torch.equal(model(X[:5]), new_model(X[:5])))
```

The state dict names its tensors by the layer's position in the `nn.Sequential`: `1.weight`, `1.bias`, `3.weight`, and so on. The layers without parameters, `0` and `2`, have none.

The loaded hyperparameters build a model of the same structure, and it knows nothing at first: its accuracy is 0.0976, a guess among 10 digits. `load_state_dict` puts the saved numbers in, and the accuracy is the saved model's 0.8687, with the same predictions, to the last number. `weights_only=True` makes `torch.load` accept only tensors and plain Python data, so a file can't make it run code, which is what you want from a file you didn't write yourself.

> [!NOTE]
> The files are only kept while a page's code runs, so a saved file is gone the next time. And the page's PyTorch writes files in a format of its own, which only it reads: a file made on your computer can't be loaded here, or the other way round. On your computer, `torch.save` writes the usual `.pt` file.

## A model of another shape

`load_state_dict` is strict: the model must have the layers and the shapes of the weights that were saved, or it stops, and says so:

```python run
import torch
import torch.nn as nn


def make_model(n_inputs, n_hidden, n_classes):
    return nn.Sequential(
        nn.Flatten(),
        nn.Linear(n_inputs, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_classes),
    )


saved = make_model(64, 50, 10).state_dict()
make_model(64, 50, 10).load_state_dict(saved)
print("same shape: loaded")
make_model(64, 40, 10).load_state_dict(saved)
```

A model with 40 hidden numbers can't take the weights of one with 50, and the message lists every layer that doesn't fit. That's why the hyperparameters are kept with the weights.

Another thing to do after loading, before using the model: `model.eval()`, as for any model that isn't being trained. A new model is in training mode, and so is one that was just loaded.

## Tuning hyperparameters

Hyperparameters aren't learned: the learning rate, the number of hidden numbers, the number of epochs. They're chosen by trying: train a model with some, measure it on the validation rides, and keep the best. Trying all the combinations takes too long, so a common way is **random search**: draw the settings at random, a few times, and keep what scored best. A learning rate is drawn on a **log scale**, the exponent between 10⁻² and 10^−0.5, because the difference between 0.001 and 0.01 matters as much as between 0.01 and 0.1.

The settings are drawn from a generator of their own, so that the random numbers of training, which shuffles the batches, don't change them. Each trial starts from the same seed:

```python run
import torch
import torch.nn as nn
import torchmetrics
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
valid_loader = DataLoader(valid_set, batch_size=64)


def make_model(n_inputs, n_hidden, n_classes):
    return nn.Sequential(
        nn.Flatten(),
        nn.Linear(n_inputs, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_hidden),
        nn.ReLU(),
        nn.Linear(n_hidden, n_classes),
    )


def train(model, learning_rate, n_epochs):
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    for epoch in range(n_epochs):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()


def accuracy(model):
    metric = torchmetrics.Accuracy(task="multiclass", num_classes=10)
    model.eval()
    with torch.no_grad():
        for X_batch, y_batch in valid_loader:
            metric.update(model(X_batch), y_batch)
    return metric.compute().item()


generator = torch.Generator().manual_seed(7)
best = None
for trial in range(6):
    learning_rate = 10 ** (torch.rand(1, generator=generator).item() * 1.5 - 2)
    n_hidden = int(torch.randint(20, 101, (1,), generator=generator).item())

    torch.manual_seed(42)
    model = make_model(64, n_hidden, 10)
    train(model, learning_rate, 5)
    score = accuracy(model)
    print(trial + 1, round(learning_rate, 4), n_hidden, round(score, 3))
    if best is None or score > best[0]:
        best = (score, learning_rate, n_hidden)

print("best", round(best[0], 3), round(best[1], 4), best[2])
```

Of the six trials, the best has a learning rate of 0.0975 and 31 hidden numbers, with an accuracy of 0.855 after 5 epochs. Three of the others, with a learning rate between 0.02 and 0.04, learned too slowly in the 5 epochs: below 0.52. In real tuning, the winner is trained again, for longer, and measured on the test set, once. Libraries like Optuna do the drawing smarter: they look at the trials so far, and draw from where good settings were, and they stop trials that go badly early. They run on your computer, as this page doesn't have them.

## Summary

- A model's learned numbers are its `state_dict()`. `torch.save` writes a checkpoint, a dictionary with the state dict and the hyperparameters that built the model, and `torch.load(..., weights_only=True)` reads it.
- To load: build a model from the saved hyperparameters, `load_state_dict` the weights into it, and call `eval()`. The shapes have to match exactly.
- Hyperparameters, like the learning rate and the layer sizes, aren't learned. They're chosen by training with several and comparing the validation scores.
- Random search draws the settings at random, a learning rate on a log scale, and keeps the best. The test set stays untouched until the best model is chosen.

## Check yourself

<details>
<summary>Why does the checkpoint hold the hyperparameters and not only the weights?</summary>

The weights are a dictionary of tensors, and they don't say how the layers fit together. To load them, a model of exactly the same structure has to be built first, and the hyperparameters, like the sizes of the layers, are what builds it.

</details>

<details>
<summary>Why is a learning rate drawn as <code>10 ** uniform(-2, -0.5)</code> and not as <code>uniform(0.01, 0.3)</code>?</summary>

Drawing between 0.01 and 0.3 would put nine in ten learning rates above 0.03, and almost none near 0.01. Learning rates matter in multiples, so the exponent is what's drawn evenly: as many tries between 0.01 and 0.03 as between 0.1 and 0.3.

</details>

<details>
<summary>The best of the random trials is chosen on the validation set. Why not on the test set?</summary>

Choosing by the test score makes the test set part of the choice, and the best of many trials scores well partly by luck. The test set is kept to measure the chosen model once, as an estimate of how it does on rides it was never used for.

</details>

## Your turn

In [Save and load a checkpoint](../../exercises/05-pytorch/10-saving-loading-and-tuning/01-save-and-load-a-checkpoint/task.md), you'll write the two halves of a checkpoint: saving a model with its settings, and building it back. In [Random search](../../exercises/05-pytorch/10-saving-loading-and-tuning/02-random-search/task.md), you'll draw settings at random, and pick the best.
