---
description: Train faster with momentum and Adam, lower the learning rate as training goes on, and keep a network from memorizing its training pictures with weight decay and dropout.
---

# Regularization and optimizers

The network of [Classifying images](09-classifying-images.md) was trained with plain SGD, and nothing kept it from learning its training pictures by heart. Hardly any real training looks like that. This lesson has what nearly every training run uses: optimizers that take better steps, a learning rate that changes as training goes on, and two ways of making a network worse at memorizing, so that it does better on pictures it hasn't seen. All of it is tried on the digits.

## Momentum

Plain SGD takes a step of the learning rate times the slope, and forgets it. With **momentum**, the optimizer keeps a **velocity** for every parameter. At each step, the velocity becomes 0.9 times what it was, plus the new slope, and the parameter moves by the learning rate times the velocity. Steps in the same direction add up, as for a ball that gathers speed while it rolls downhill.

Here's a loss whose slope is the same everywhere, so that the steps are easy to follow: `-w` has the slope −1 wherever `w` is, so downhill is always to the right. An optimizer takes any list of tensors to change, not only a model's parameters:

```python run
import torch

w = torch.tensor(0.0, requires_grad=True)
optimizer = torch.optim.SGD([w], lr=0.1, momentum=0.9)

for step in range(5):
    optimizer.zero_grad()
    loss = -w
    loss.backward()
    optimizer.step()
    print(step + 1, round(w.item(), 4))
```

Plain SGD would move `w` by 0.1 at every step. With a momentum of 0.9, the steps are 0.1, 0.19, 0.271, 0.3439 and 0.4095: each is 0.9 times the one before, plus the new 0.1. They grow towards 1, ten times the plain step, because $0.1 / (1 - 0.9) = 1$. So when the slopes keep pointing the same way, a momentum of 0.9 works like a learning rate ten times as big. When they point one way and then the other, as they do when the steps overshoot, they cancel out in the velocity, which a bigger learning rate wouldn't do for them.

## Adam

Momentum still has one learning rate for all the parameters. But the slopes of a network's parameters aren't all of the same size, and a learning rate that suits the big ones hardly moves the small ones. **Adam** gives every parameter a step of its own size. It keeps two running averages for each parameter: one of its slopes, as momentum does, and one of their squares. The step is the first average divided by the square root of the second, times the learning rate. A slope that's always big and a slope that's always small both come out as about 1:

```python run
import torch

slopes = torch.tensor([100.0, 0.01])

for optimizer_class in [torch.optim.SGD, torch.optim.Adam]:
    w = torch.zeros(2, requires_grad=True)
    optimizer = optimizer_class([w], lr=0.1)
    for step in range(3):
        optimizer.zero_grad()
        loss = (w * slopes).sum()
        loss.backward()
        optimizer.step()
    print(optimizer_class.__name__, [round(number, 4) for number in w.tolist()])
```

The two parameters have slopes of 100 and 0.01 at every step. After 3 steps, SGD has moved the first one by 30 and the second by 0.003, ten thousand times less. Adam has moved both by 0.3, the learning rate at each step: what counts for Adam is which way a slope points and how steadily, and not how big it is. That makes it much less touchy about the learning rate, and its default one, 0.001, works for many networks without any trying.

## On the digits

Here are the three on the network of [Classifying images](09-classifying-images.md#training), with the same learning rate of 0.01, the same starting weights and the same batches. `train` takes an optimizer's class and its settings, and returns the accuracy on the validation pictures after each of 5 epochs. `**settings` collects the settings that are given by name, like `lr=0.01`, into a dictionary, and passes them on to the optimizer, as `**inputs` did for a model in [Your own modules](08-your-own-modules.md#named-inputs):

```python run
import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]


def train(optimizer_class, **settings):
    torch.manual_seed(42)
    model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
    criterion = nn.CrossEntropyLoss()
    optimizer = optimizer_class(model.parameters(), **settings)
    accuracies = []
    for epoch in range(5):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
        model.eval()
        with torch.no_grad():
            accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
        accuracies.append(round(accuracy, 3))
    return accuracies


print("SGD     ", train(torch.optim.SGD, lr=0.01))
print("momentum", train(torch.optim.SGD, lr=0.01, momentum=0.9))
print("Adam    ", train(torch.optim.Adam, lr=0.01))
```

After 5 epochs, plain SGD reads 24% of the validation pictures, SGD with momentum 88%, and Adam 96%. That doesn't make SGD a worse optimizer: with a learning rate of 0.1, it read 94% after 10 epochs in [Classifying images](09-classifying-images.md#training), and momentum at 0.01 gets to 95% in 10 epochs too, as the ten times of the first section says it should. SGD needs its learning rate to be found, and Adam's steps come out about the right size by themselves.

## A learning rate that changes

A big learning rate gets a network near a good place fast, and then keeps it bouncing around it. A small one settles down, and takes forever to arrive. A **schedule** starts big and ends small. The schedules are in `torch.optim.lr_scheduler`: a scheduler is made for an optimizer, and its `step()`, called once at the end of every epoch, sets the optimizer's learning rate for the next one.

`CosineAnnealingLR` lowers the learning rate along half a wave of a cosine, from where it starts down to 0 over `T_max` epochs: slowly at first, fastest in the middle, and slowly again at the end. Here's Adam with a constant 0.01, and with the schedule. The columns are the epoch, the learning rate during it, and the accuracy after it:

```python run
import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]


def train(with_schedule, n_epochs=10):
    torch.manual_seed(42)
    model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    scheduler = None
    if with_schedule:
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=n_epochs)
    for epoch in range(n_epochs):
        learning_rate = optimizer.param_groups[0]["lr"]
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
        if scheduler is not None:
            scheduler.step()
        model.eval()
        with torch.no_grad():
            accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
        print(epoch + 1, round(learning_rate, 4), round(accuracy, 3))


print("constant")
train(with_schedule=False)
print("cosine")
train(with_schedule=True)
```

With the constant learning rate, the last five epochs bounce between 94.6% and 97.3%, and the training happens to end on the worst of them. With the schedule, the steps shrink as the network gets close, and the last five epochs stay between 96.6% and 97.3%.

`optimizer.param_groups[0]["lr"]` is where an optimizer keeps its learning rate. Its settings are in a list of dictionaries, one for each group of parameters, and here there's a single group. There are other schedulers: `StepLR(optimizer, step_size=3, gamma=0.5)` halves the learning rate every 3 epochs, and `ExponentialLR(optimizer, gamma=0.9)` multiplies it by 0.9 after every epoch. Whichever it is, the order in the loop is `optimizer.step()` for every batch, and then `scheduler.step()` when the epoch is over.

## Weight decay

To see a network memorize, give it less to learn from: 200 of the 1,500 training pictures, for 100 epochs. The network has 12,060 parameters, plenty for learning 200 pictures by heart. That's the [overfitting](../04-foundations/04-neural-networks/03-training.md#overfitting-and-validation) of the neural network chapter, which stopped the training early, or took a smaller network. PyTorch has two more cures built in, and both are forms of **regularization**: anything that makes a model fit its training data less closely, so that it does better on new data.

A network that memorizes single pictures needs big weights, which make its answers swing on small changes of a picture. **Weight decay** pulls every weight towards 0 at every step: with `weight_decay=0.5`, a step also takes away the learning rate times 0.5 times the weight itself. It's the [extra penalty for big weights](../04-foundations/03-logistic-regression/03-training.md#when-the-groups-dont-overlap) of logistic regression, as a setting of the optimizer. Here are two weights that the loss doesn't depend on, so that its slope for them is 0:

```python run
import torch

w = torch.tensor([1.0, -2.0], requires_grad=True)
optimizer = torch.optim.SGD([w], lr=0.1, weight_decay=0.5)

for step in range(3):
    optimizer.zero_grad()
    loss = (w * 0.0).sum()
    loss.backward()
    optimizer.step()
    print(step + 1, [round(number, 4) for number in w.tolist()])
```

Each step takes 0.1 × 0.5 = 5% off both weights, whatever their sign. A weight that the data needs is held in place by the slopes of the loss, and one that it doesn't need fades away.

With Adam, weight decay is spelled `AdamW`. It takes the decay straight off the weights, as above. `Adam(..., weight_decay=...)` adds the pull to the slope instead, and Adam then divides it by the size of that parameter's slopes, so every parameter decays at a rate of its own. `AdamW` is what most of today's networks are trained with. Here's the small training set without the decay, and with it. The columns are the epoch, the loss on the 200 training pictures, and the loss on the validation pictures:

```python run
import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
X_train, y_train = X[train_set.indices[:200]], y[train_set.indices[:200]]
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)
criterion = nn.CrossEntropyLoss()


def train(weight_decay):
    torch.manual_seed(42)
    model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.01, weight_decay=weight_decay)
    for epoch in range(100):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
        if epoch + 1 in [10, 30, 100]:
            model.eval()
            with torch.no_grad():
                train_loss = criterion(model(X_train), y_train).item()
                valid_loss = criterion(model(X_valid), y_valid).item()
            print(epoch + 1, round(train_loss, 3), round(valid_loss, 3))
    with torch.no_grad():
        accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
        size = sum((parameter ** 2).sum().item() for parameter in model.parameters())
    print("accuracy", round(accuracy, 3), "weights", round(size))


print("no weight decay")
train(weight_decay=0.0)
print("weight decay 0.1")
train(weight_decay=0.1)
```

Without the decay, which makes `AdamW` plain Adam, the loss on the training pictures falls to 0.001: the network knows them by heart. Meanwhile, its loss on the validation pictures rises, from 0.39 to 0.55. With the decay, the weights stay smaller: the squares of all the network's numbers add up to 218, not 332. The training loss doesn't get quite as low, and the validation loss stays near 0.37.

The accuracy hardly differs, 91.6% and 91.9%. The loss shows overfitting before the accuracy does, because it also counts how sure the network is, and a network that memorizes gets ever more sure of its wrong answers.

## Dropout

**Dropout** makes memorizing hard in another way. During training, an `nn.Dropout(p)` layer sets each of the numbers that pass through it to 0 with the probability `p`, different ones at every step, and multiplies the rest by $1 / (1 - p)$, so that they add up to about as much as before. The network can't count on any one hidden number being there, so it has to spread what it knows over many of them. When the network is used, nothing is dropped:

```python run
import torch
import torch.nn as nn

torch.manual_seed(42)
dropout = nn.Dropout(p=0.5)
x = torch.ones(10)

print(dropout.training)
print(dropout(x))
print(dropout(x))

dropout.eval()
print(dropout.training)
print(dropout(x))
```

In training mode, each of the ten ones had an even chance of becoming 0, and different ones did each time. The rest became 2. After `eval()`, the layer passes its input on as it is. This is what `model.train()` and `model.eval()` have been for since [Batches and evaluation](06-batches-and-evaluation.md#an-epoch): until now, they changed nothing. With dropout, a forgotten `model.eval()` means predictions that change from one call to the next, each made with half of the network missing.

> [!NOTE]
> Which numbers are dropped is drawn at random, and this page draws them in a way of its own. So with dropout, even after `torch.manual_seed`, your computer won't give the numbers of this page: other ones are set to 0 above, and the losses below come out a little different. Everything without dropout is the same in both places, as before.

Here's the small training set again, with a dropout layer after each hidden layer:

```python run
import torch
import torch.nn as nn
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
X_train, y_train = X[train_set.indices[:200]], y[train_set.indices[:200]]
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)
criterion = nn.CrossEntropyLoss()

torch.manual_seed(42)
model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(64, 100),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(100, 50),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(50, 10),
)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

for epoch in range(100):
    model.train()
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()
    if epoch + 1 in [10, 30, 100]:
        model.eval()
        with torch.no_grad():
            train_loss = criterion(model(X_train), y_train).item()
            valid_loss = criterion(model(X_valid), y_valid).item()
        print(epoch + 1, round(train_loss, 3), round(valid_loss, 3))

with torch.no_grad():
    accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
print("accuracy", round(accuracy, 3))
```

On this page, the loss on the validation pictures ends at 0.25, less than half of the 0.55 without dropout, and the network reads 93.6% of them, where the other two read under 92%. It learned the training pictures all the same: their loss is 0.005, measured with dropout off, since `model.eval()` comes before it.

Weight decay and dropout can be used together, and neither replaces the oldest cure, which is more pictures: without either of them, the same network read 97% of the validation pictures in [A learning rate that changes](#a-learning-rate-that-changes), where it had all 1,500 to learn from.

## Summary

- Momentum keeps a velocity for each parameter, so that steps in the same direction add up: `torch.optim.SGD(..., momentum=0.9)`.
- Adam gives every parameter a step of its own size, from the average of its slopes and the average of their squares, so it needs less tuning: `torch.optim.Adam`, with a default learning rate of 0.001.
- A scheduler changes the learning rate as training goes on. Its `step()` is called once an epoch, after the optimizer's steps.
- Regularization makes a model fit its training data less closely. Weight decay pulls every weight towards 0 at each step: `weight_decay=`, and `AdamW` with Adam.
- `nn.Dropout(p)` sets numbers to 0 at random during training, and does nothing in evaluation mode. `model.train()` and `model.eval()` switch between the two.
- Overfitting shows in the validation loss, which rises while the training loss keeps falling, before it shows in the accuracy.

## Check yourself

<details>
<summary>SGD with <code>lr=0.01</code> and <code>momentum=0.9</code> meets the same slope at every step. How big do its steps get?</summary>

Ten times the plain step. Each velocity is 0.9 times the last one plus the slope, which grows towards the slope divided by $1 - 0.9$, so ten slopes. The steps come close to those of plain SGD with a learning rate of 0.1.

</details>

<details>
<summary>One parameter's slope is always 100, and another's is always 0.01. How far has Adam moved each of them after 3 steps with <code>lr=0.1</code>?</summary>

Both by about 0.3. Adam divides the average slope of a parameter by the usual size of its slopes, which gives about 1 for a steady slope of any size, so each step moves the parameter by about the learning rate.

</details>

<details>
<summary>A network with dropout gives different predictions for the same picture every time it's called. What was forgotten?</summary>

`model.eval()`. In training mode, a dropout layer sets other numbers to 0 at every call, so the answers change. Evaluation mode switches the dropping off, and the network answers with all of its hidden numbers.

</details>

## Your turn

In [Compare optimizers](../../exercises/05-pytorch/11-regularization-and-optimizers/01-compare-optimizers/task.md), you'll make optimizers by name, and compare them fairly, from the same starting weights. In [Dropout and weight decay](../../exercises/05-pytorch/11-regularization-and-optimizers/02-dropout-and-weight-decay/task.md), you'll build a network with dropout, give it an optimizer with weight decay, and predict with dropout switched off.
