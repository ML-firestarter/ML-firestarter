---
description: Attack with many small steps instead of one, each followed by a projection back into the ε-ball. PGD, a random start, the step size and the number of steps, and training on attacked pictures.
---

# PGD

[FGSM](01-fooling-a-network.md) measures the slopes once, at the picture, and follows them all the way to the edge of the ε-ball. That's quick, and it leaves pictures unfooled that could be fooled. This lesson takes many small steps instead, measures the slopes again before each, and brings the picture back into the ball whenever a step leaves it. That's **projected gradient descent**, or **PGD**, and it's the attack that networks are measured against.

## Slopes that change

Here's a picture that FGSM doesn't manage: number 207 of the validation pictures, another 0. The example takes the slopes at the picture, makes FGSM's step with ε = 0.1, and takes the slopes again where the step ends. The first lines are the ones of [every example of this chapter](01-fooling-a-network.md#the-network):

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

torch.manual_seed(42)
model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
for epoch in range(10):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()
model.eval()


def slope_at(pictures, labels):
    pictures = pictures.clone().requires_grad_()
    return torch.autograd.grad(criterion(model(pictures), labels), pictures)[0]


original, label = X_valid[207:208], y_valid[207:208]
epsilon = 0.1

before = slope_at(original, label)
attacked = (original + epsilon * before.sign()).clamp(0, 1)
after = slope_at(attacked, label)

with torch.no_grad():
    print(label, model(attacked).argmax(dim=1))
    print(round(criterion(model(original), label).item(), 3), round(criterion(model(attacked), label).item(), 3))
print((before.sign() != after.sign()).sum())
```

The loss went from 0.012 to 1.187, and the network still reads a 0. The last line counts the pixels whose slope has another sign at the end of the step than at its start: 10 of the 64. By the end of the step, those ten pixels were being pushed the wrong way.

The slopes change because a network isn't a straight line. Its ReLUs switch on and off as the picture moves, and each switch changes which weights the pixels act through. FGSM's one measurement is only right near the picture.

## Small steps

So take a small step, of a size called α, alpha, and measure again. Four steps of 0.025 can take a pixel as far as one step of 0.1, and each of them follows the slopes of the place where the picture is by then. The columns are the step, the loss after it, and what the network reads:

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

torch.manual_seed(42)
model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
for epoch in range(10):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()
model.eval()


def slope_at(pictures, labels):
    pictures = pictures.clone().requires_grad_()
    return torch.autograd.grad(criterion(model(pictures), labels), pictures)[0]


original, label = X_valid[207:208], y_valid[207:208]
alpha = 0.025

attacked = original.clone()
for step in range(4):
    slope = slope_at(attacked, label)
    attacked = (attacked + alpha * slope.sign()).clamp(0, 1)
    with torch.no_grad():
        print(step + 1, round(criterion(model(attacked), label).item(), 3), model(attacked).argmax(dim=1))
print((attacked - original).abs().max())
```

After the fourth step, the loss is 1.424, more than FGSM's 1.187, and the network reads a 2. No pixel is further than 0.1 from where it was, so this picture is in the same ε-ball as FGSM's. The small steps found a better place in it.

## Back into the ball

More steps could find a still better place, but a fifth step of 0.025 would take some pixels 0.125 away from where they started, out of the ball. So after every step, the picture is **projected** back: replaced by the picture inside the ball that's nearest to it. For this ball, the nearest picture is found a pixel at a time. A pixel that's more than ε above where it started is put at exactly ε above, one that's more than ε below at exactly ε below, and the others are left alone. That's a `clamp` of the differences:

```python run
import torch


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


original = torch.tensor([0.2, 0.5, 0.95, 0.0])
moved = torch.tensor([0.35, 0.45, 1.2, -0.3])
print(moved - original)

projected = project(moved, original, 0.1)
print(projected)
print(projected - original)
```

The first pixel was 0.15 above its start, and comes back to 0.1 above, at 0.3. The second was inside the ball, and stays where it is. The third comes back to 0.1 above 0.95, which is 1.05, and the last `clamp(0, 1)` makes it a valid pixel, at 1. The fourth comes back to −0.1, and then to 0. All four differences are now between −0.1 and 0.1.

## Projected gradient descent

With the projection after each step, the attack can take as many steps as it likes:

```python run
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.datasets import load_digits
from torch.utils.data import DataLoader, TensorDataset, random_split

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)
train_set, valid_set = random_split(TensorDataset(X, y), [1500, 297], generator=torch.Generator().manual_seed(1))
train_loader = DataLoader(train_set, batch_size=32, shuffle=True)
X_valid, y_valid = X[valid_set.indices], y[valid_set.indices]

torch.manual_seed(42)
model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
for epoch in range(10):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()
model.eval()


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


original, label = X_valid[207:208], y_valid[207:208]
for steps in [4, 10, 20]:
    attacked = pgd(model, original, label, 0.1, 0.025, steps)
    with torch.no_grad():
        loss = criterion(model(attacked), label)
        probabilities = F.softmax(model(attacked), dim=1)
    print(steps, round(loss.item(), 3), probabilities.argmax(dim=1), round(probabilities.max().item(), 2), (attacked - original).abs().max())
```

Each turn of the loop marks the picture, takes the slopes where it is, steps along their signs, and projects the result into the ball around `X`, the picture that the attack started from. `X_adv.detach() + ...` makes a new, unmarked tensor at each step, as `changed` was in [The slope for an input](../05-pytorch/02-autograd.md#the-slope-for-an-input), so nothing is recorded from one step to the next.

With 4 steps, the loss is the 1.424 of before. With 10, it's 1.813, and the network reads a 2 with a probability of 0.60. Ten more steps find nothing more, and the picture never leaves the ball: the biggest change is 0.1 every time.

The name says descent although the attack climbs. It's the name of the general method, steps along the slopes with a projection after each, whichever way the steps go.

## A random start

The loop above starts at the picture itself. PGD usually starts somewhere else: at a random picture inside the ball. `torch.rand_like(X)` gives random numbers from 0 to 1 in the shape of `X`, so `torch.rand_like(X) * 2 - 1` goes from −1 to 1, and times ε, that's a random move inside the ball for every pixel.

There are two reasons for it. Right at the picture, the slopes can be poor guides, or 0, as they'll be in [Targets and norms](03-targets-and-norms.md#attacking-an-embedding). And each start can end at another picture, so the attack can be run a few times, with a picture counted as fooled if any of the runs fooled it. Here's PGD with 8 **restarts** on all the validation pictures. The columns are the restart, the accuracy on its pictures, and the fraction of pictures that no restart so far has fooled:

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

torch.manual_seed(42)
model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
for epoch in range(10):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()
model.eval()


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps, random_start=False):
    X_adv = X.clone()
    if random_start:
        X_adv = project(X + (torch.rand_like(X) * 2 - 1) * epsilon, X, epsilon)
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


torch.manual_seed(0)
never_fooled = torch.ones(len(X_valid))
for restart in range(8):
    X_adv = pgd(model, X_valid, y_valid, 0.1, 0.025, 20, random_start=True)
    with torch.no_grad():
        right = (model(X_adv).argmax(dim=1) == y_valid).float()
    never_fooled = never_fooled * right
    print(restart + 1, round(right.mean().item(), 3), round(never_fooled.mean().item(), 3))
```

A single restart leaves the network at between 50.5% and 52.9%. After all 8, 50.5% of the pictures have never been fooled, which is one picture fewer than the 50.8% that PGD leaves when it starts from the picture itself. On this small network, the start hardly matters: wherever PGD begins, it ends up fooling nearly the same pictures. The loss of a big network has many peaks inside a ball, and the start decides which of them the attack climbs, so for those a random start and a few restarts are part of the standard attack.

## The step size and the number of steps

PGD has two settings that FGSM doesn't have. Here's the accuracy on the validation pictures at ε = 0.1 for a few of them, without the random start, so that the rows can be compared:

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

torch.manual_seed(42)
model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
for epoch in range(10):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()
model.eval()


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


for alpha, steps in [(0.1, 1), (0.025, 4), (0.025, 10), (0.025, 20), (0.025, 100), (0.005, 20), (0.1, 20)]:
    X_adv = pgd(model, X_valid, y_valid, 0.1, alpha, steps)
    print(alpha, steps, round(accuracy(model, X_adv, y_valid), 3))
```

One step of the whole ε is FGSM, with its 55.9%. With steps of 0.025, 4 of them leave 53.2%, 10 leave 51.5%, and 20 leave 50.8%. A hundred steps do no better than 20: the attack has found what there is to find in this ball.

Steps that are too small waste the attack. Twenty steps of 0.005 only just reach the edge of the ball, and leave 52.5%. Steps that are too big do no harm here, 20 steps of the whole ε leave 50.8% too, because the projection holds them in. On bigger networks, they can jump from one side of the ball to the other, and miss what's in between.

So the steps times α should come to a good deal more than ε: enough to cross the ball, with steps left over to search once it's crossed. A common rule of thumb is α = 2.5 ε / steps. For photos, ε = 8/255 with α = 2/255 and 10 or 20 steps is a usual setting.

## Accuracy against ε

Here are both attacks on the validation pictures, with α a quarter of ε and 20 steps for PGD. The columns are ε, the accuracy under FGSM, and the accuracy under PGD:

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

torch.manual_seed(42)
model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
for epoch in range(10):
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        criterion(model(X_batch), y_batch).backward()
        optimizer.step()
model.eval()


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


for epsilon in [0.0, 0.05, 0.1, 0.15, 0.2]:
    X_fgsm = pgd(model, X_valid, y_valid, epsilon, epsilon, 1)
    X_pgd = pgd(model, X_valid, y_valid, epsilon, epsilon / 4, 20)
    print(epsilon, round(accuracy(model, X_fgsm, y_valid), 3), round(accuracy(model, X_pgd, y_valid), 3))
```

PGD is never the weaker of the two, and the gap grows with ε: at 0.15, FGSM leaves 19.9% of the pictures read right, and PGD 10.4%, about half as many.

That's why the attack matters when a network's robustness is reported. An accuracy under attack only says that this attack didn't do better, so a weak attack makes a network look more robust than it is. The number to trust is the one from the strongest attack that was tried, and PGD with enough steps is where that starts.

## Going further: adversarial training

The network has only ever seen pictures as they were. **Adversarial training** shows it attacked ones: every batch is attacked before the network learns from it, with PGD against the network as it is at that moment. The attack takes a few steps only, here 5, because it runs for every batch. It leaves the `.grad` of the parameters alone, as it asks `torch.autograd.grad` for the pictures' slopes and nothing else, so it fits in the middle of the training loop:

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
criterion = nn.CrossEntropyLoss()


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


def train(adversarial):
    torch.manual_seed(42)
    model = nn.Sequential(nn.Flatten(), nn.Linear(64, 100), nn.ReLU(), nn.Linear(100, 50), nn.ReLU(), nn.Linear(50, 10))
    optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
    for epoch in range(10):
        for X_batch, y_batch in train_loader:
            if adversarial:
                X_batch = pgd(model, X_batch, y_batch, 0.1, 0.025, 5)
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
    model.eval()
    return model


for adversarial in [False, True]:
    model = train(adversarial)
    X_adv = pgd(model, X_valid, y_valid, 0.1, 0.025, 20)
    print(adversarial, round(accuracy(model, X_valid, y_valid), 3), round(accuracy(model, X_adv, y_valid), 3))
```

The columns are whether the training was adversarial, the accuracy on the validation pictures as they are, and the accuracy under PGD with ε = 0.1, made against the network that's being measured. The plain network reads 94.3% and 50.8%. The one trained on attacked pictures reads 68% under attack. It pays for that with the untouched pictures, of which it reads 90.2%, and with time: every step of the optimizer now comes after 5 steps of the attack, so the training takes several times as long.

With 20 epochs instead of 10, it reads 94.3% of the untouched pictures and 75.4% under attack, where the plain network, trained for as long, reads 96% and 47.8%. That's still a long way from robust, on pictures of 64 pixels. Of the defences that have been tried, this one has held up best, and making networks robust at a price worth paying is an open problem.

## Summary

- FGSM's slopes are only right near the picture. PGD takes many small steps of size α, with new slopes for each.
- After each step, the picture is projected back into the ε-ball around the picture that the attack started from: `X + (X_adv - X).clamp(-epsilon, epsilon)`, and then `clamp(0, 1)`.
- A random start picks a random picture in the ball to begin from, and restarts run the attack from several of them.
- The steps times α should come to well over ε. More steps find more, up to a point.
- An accuracy under attack is only as good as the attack. PGD is at least as strong as FGSM, and it's the usual measure.
- Adversarial training attacks every batch before learning from it. The network gets more robust, and a little worse on untouched pictures.

## Check yourself

<details>
<summary>A pixel started at 0.4. After a step of PGD with ε = 0.1, it's at 0.56. Where does the projection put it?</summary>

At 0.5. It's 0.16 above where it started, more than ε, so it comes back to exactly ε above: 0.4 + 0.1. The ball is around the picture that the attack started from, not around the picture of the step before.

</details>

<details>
<summary>PGD runs with ε = 0.1, α = 0.001 and 20 steps. What's wrong with these settings?</summary>

The steps are too small. Twenty steps of 0.001 move a pixel by 0.02 at most, a fifth of the way to the edge of the ball, so most of the ball is never reached, and the network looks more robust than it is. The steps times α should come to well over ε.

</details>

<details>
<summary>A network reads 80% of the pictures right under FGSM with ε = 0.1. Is its accuracy under attack at that ε 80%?</summary>

It's 80% at most. FGSM is a weak attack, and a stronger one, like PGD with enough steps, will usually fool more pictures in the same ball. The 80% says what FGSM couldn't do, not what can't be done.

</details>

<details>
<summary>Why can <code>pgd</code> be called in the middle of a training loop without disturbing it?</summary>

It gets its slopes from `torch.autograd.grad(loss, X_adv)`, which returns the slopes for the pictures and puts nothing in the `.grad` of the parameters. An attack that called `backward()` would add its slopes to the parameters' `.grad`, where the optimizer would use them unless they were cleared first.

</details>

## Your turn

In [Back into the ball](../../exercises/07-adversarial-examples/02-pgd/01-back-into-the-ball/task.md), you'll write the projection, and see what it does to pixels on every side of the ball. In [Projected gradient descent](../../exercises/07-adversarial-examples/02-pgd/02-projected-gradient-descent/task.md), you'll write the whole attack.
