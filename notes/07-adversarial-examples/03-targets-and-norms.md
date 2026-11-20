---
description: Aim an attack at a chosen class, measure a perturbation with the L∞ and L2 norms, attack inside a round ball, and push a picture's embedding away without any label.
---

# Targets and norms

The attacks so far wanted the network wrong, and didn't care how. A driver cares: a 1 that's read as a 4 is of no use to someone who wanted a 7. This lesson aims the attack at a class. Then it looks at how the size of a change is measured, since the biggest change of a pixel isn't the only way, and it ends with an attack on a network's embeddings, which needs no classes at all.

## Towards a class

An attack that takes any wrong answer is **untargeted**. It climbs the loss for the right label. A **targeted** attack has a label that it wants, the **target**, and it goes down the loss for that label, so the steps are taken against the signs of the slopes. That's a training loop turned on the picture: gradient descent towards a label, with the pixels changing and the weights staying as they are.

Here's [PGD](02-pgd.md#projected-gradient-descent) with one more setting. With `targeted=True`, `y` holds the labels that the attacker wants, and the slopes are turned around. The picture is the second of the validation pictures, a 1, and the target is a 7:

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


def as_text(picture):
    return ["".join(" .:*#"[int(pixel * 4.99)] for pixel in row) for row in picture.tolist()]


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps, targeted=False):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        if targeted:
            slope = -slope
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


original, label = X_valid[1:2], y_valid[1:2]
target = torch.tensor([7])

for epsilon in [0.1, 0.15, 0.2]:
    attacked = pgd(model, original, target, epsilon, epsilon / 4, 20, targeted=True)
    with torch.no_grad():
        probabilities = F.softmax(model(attacked), dim=1)
    print(epsilon, probabilities.argmax(dim=1), round(probabilities[0, 7].item(), 2))

attacked = pgd(model, original, target, 0.15, 0.15 / 4, 20, targeted=True)
for before, after in zip(as_text(original[0, 0]), as_text(attacked[0, 0])):
    print(before, "  ", after)
```

The columns are ε, what the network reads, and the probability that it gives a 7. With ε = 0.1, the network still reads a 1, and gives a 7 only 0.19. With 0.15, it reads a 7, and with 0.2, it's nearly sure of it, at 0.94. The pictures below are the driver's 1 and the one that's read as a 7 with ε = 0.15.

A target costs more than a mistake. Here's ε = 0.15 on all the validation pictures: first the fraction that an untargeted PGD fools, and then, for each digit, the fraction of the pictures of other digits that a targeted PGD gets read as that digit. `torch.full_like(y_valid[others], digit)` is a tensor like those labels, filled with the digit:

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


def pgd(model, X, y, epsilon, alpha, steps, targeted=False):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        if targeted:
            slope = -slope
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


epsilon = 0.15
X_adv = pgd(model, X_valid, y_valid, epsilon, epsilon / 4, 20)
print("any", round(1 - accuracy(model, X_adv, y_valid), 3))

for digit in range(10):
    others = y_valid != digit
    targets = torch.full_like(y_valid[others], digit)
    X_adv = pgd(model, X_valid[others], targets, epsilon, epsilon / 4, 20, targeted=True)
    print(digit, round(accuracy(model, X_adv, targets), 3))
```

The untargeted attack fools the network on 89.6% of the pictures. Aimed at one digit, the same ε gets from 17.8% of the pictures, for a 6, to 61.8% of them, for an 8. Some digits are easy to reach from most others, and some are hard, but none comes close to what an attack does that will take any mistake.

## Measuring a perturbation

The change that an attack makes to a picture, `X_adv - X`, is called a **perturbation**. Its size has been the biggest change of any pixel so far. That's one **norm**, one way of putting a single number on the size of a whole list of numbers, and there are others. The two that are used the most:

- The **L∞ norm** is the biggest of the changes, with their signs dropped: `delta.abs().max()`.
- The **L2 norm** is the square root of the sum of their squares: `delta.norm()`. That's the length of the perturbation: the straight-line distance between the two pictures, worked out as Pythagoras's theorem works out the diagonal of a rectangle, with a side for every pixel.

Here are two perturbations of a picture of four pixels. The first changes every pixel by 0.1, and the second changes one pixel by 0.2:

```python run
import torch

spread = torch.tensor([0.1, -0.1, 0.1, -0.1])
single = torch.tensor([0.2, 0.0, 0.0, 0.0])

for delta in [spread, single]:
    print(delta.abs().max(), delta.norm())
```

In L2, the two are the same size: four squares of 0.1 add up to 0.04, as one square of 0.2 does, and the root of that is 0.2. In L∞, the second is twice as big as the first. Which of two changes is the smaller one depends on the norm.

Each norm has its ball. With two pixels, the pictures within 0.1 of a picture in L∞ make a square, since each pixel has its own limit, and the ones within 0.1 in L2 make a circle. With three pixels, that's a cube and a ball, and the name stuck for any number of pixels and any norm. The ε-ball of the last two lessons was the square kind.

## A round ball

In the round ball, the limit is on the length of the whole perturbation. A pixel may move a long way, as long as the others move little. An attack in it differs from PGD in two places:

- The step goes along the slopes themselves, scaled to the length α, and not along their signs. With a limit on the length, the loss rises the most in the direction of the slopes, so pixels with big slopes move the most.
- The projection shortens a perturbation that's longer than ε to the length ε, without turning it.

`lengths` below gives the L2 norm of each picture of a batch: `flatten(1)` makes a row of 64 numbers out of each, `norm(dim=1)` takes the norm of each row, and `reshape(-1, 1, 1, 1)` gives the result a shape that broadcasts over a batch of pictures. The `1e-12` keeps a division by 0 away:

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


def lengths(pictures):
    return pictures.flatten(1).norm(dim=1).reshape(-1, 1, 1, 1)


def project_l2(X_adv, X, epsilon):
    delta = X_adv - X
    delta = delta * (epsilon / (lengths(delta) + 1e-12)).clamp(max=1)
    return (X + delta).clamp(0, 1)


def pgd_l2(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), y)
        slope = torch.autograd.grad(loss, X_adv)[0]
        direction = slope / (lengths(slope) + 1e-12)
        X_adv = project_l2(X_adv.detach() + alpha * direction, X, epsilon)
    return X_adv


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


X_square = pgd(model, X_valid, y_valid, 0.1, 0.1 / 4, 20)
X_round = pgd_l2(model, X_valid, y_valid, 0.5, 0.5 / 4, 20)
X_longer = pgd_l2(model, X_valid, y_valid, 0.68, 0.68 / 4, 20)

for X_adv in [X_square, X_round, X_longer]:
    delta = (X_adv - X_valid).flatten(1)
    print(round(accuracy(model, X_adv, y_valid), 3), round(delta.abs().max(dim=1).values.mean().item(), 3), round(delta.norm(dim=1).mean().item(), 3))

for X_adv in [X_square, X_round]:
    print((100 * (X_adv - X_valid)[0, 0]).round().int())
```

The three lines are the PGD of the last lesson with ε = 0.1, and the round one with ε = 0.5 and with ε = 0.68. The columns are the accuracy under attack, and the L∞ and the L2 norm of the perturbations, averaged over the pictures.

The square attack changes most pixels by its whole 0.1, and its perturbations are 0.68 long. The round attack with ε = 0.5 does nearly as much damage, 53.9% against 50.8%, with perturbations that are shorter, and whose biggest change of a pixel is twice as big, 0.21. Allowed the same length as the square one, 0.68, it leaves 23.6%.

The two tables are the perturbations of the first picture, the 0 of [Fooling a network](01-fooling-a-network.md#one-step-along-the-sign), in hundredths. In the square ball, nearly every pixel moves by 10, and the ones that move less were held by `clamp(0, 1)`. In the round ball, a few pixels move by 14, 17 or 21, and most hardly move: the budget goes where the slopes are biggest.

So which norm is the right one? Neither measures what a person sees. They're stand-ins that are easy to work with: a small L∞ norm says that no pixel changed much, and a small L2 norm that the picture didn't change much taken together. A network that holds up in one ball can fall in the other, so an accuracy under attack always comes with its norm and its ε, like "L∞, ε = 8/255".

## Attacking an embedding

The last layer of the network turns 50 numbers into 10 logits. Those 50 numbers are what the network has made of the picture by then, and they're an [embedding](../vocabulary/embedding.md) of it: pictures that look alike to the network get numbers that are close. Slicing an `nn.Sequential` gives the layers of the slice, so `model[:-1]` is the network without its last layer, with the same weights:

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


embed = model[:-1]
with torch.no_grad():
    embeddings = embed(X_valid)
print(embeddings.shape)

away = (embeddings[1:] - embeddings[0]).norm(dim=1)
print(y_valid[0], round(away[y_valid[1:] == 0].mean().item(), 2), round(away[y_valid[1:] != 0].mean().item(), 2))


def push_away(embed, X, epsilon, alpha, steps, random_start=True):
    with torch.no_grad():
        home = embed(X)
    X_adv = X.clone()
    if random_start:
        X_adv = project(X + (torch.rand_like(X) * 2 - 1) * epsilon, X, epsilon)
    for step in range(steps):
        X_adv.requires_grad_()
        distance = ((embed(X_adv) - home) ** 2).sum()
        slope = torch.autograd.grad(distance, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


original = X_valid[:1]
torch.manual_seed(0)
for random_start in [False, True]:
    attacked = push_away(embed, original, 0.1, 0.1 / 4, 20, random_start)
    with torch.no_grad():
        moved = (embed(attacked) - embed(original)).norm(dim=1)
        print(random_start, (attacked - original).abs().max(), moved, model(attacked).argmax(dim=1))
```

`away` holds the distances from the embedding of the first picture, the 0, to those of the other 296. The other 0s are 3.55 away on average, and the pictures of other digits 9.24. That's what the last layer has to work with: the 0s sit together, apart from the rest.

Many networks are used for their embeddings alone, to compare pictures or to search through them, and have no classes to attack. `push_away` attacks the embedding itself. It's PGD in the square ball, climbing another loss: the squared distance between the embedding of the attacked picture and `home`, the embedding of the picture as it was. No label comes into it.

This is the attack that can't start without a [random start](02-pgd.md#a-random-start). At the picture itself, the distance is 0, the lowest it can be, and at a lowest point every slope is 0. The signs of the slopes are then 0 too, and the picture never moves: the line that starts with `False` shows no change in the picture and none in the embedding. From a random picture in the ball, the attack moves the embedding by 3.53. That's as far as from one 0 to another, and the network still reads a 0.

Here's the attack on all the validation pictures, next to random changes of the same size. The columns are ε, how far the attack moved the embeddings on average, the fraction of the pictures that the network now reads as another digit, and the same two numbers for the random changes:

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


def push_away(embed, X, epsilon, alpha, steps):
    with torch.no_grad():
        home = embed(X)
    X_adv = project(X + (torch.rand_like(X) * 2 - 1) * epsilon, X, epsilon)
    for step in range(steps):
        X_adv.requires_grad_()
        distance = ((embed(X_adv) - home) ** 2).sum()
        slope = torch.autograd.grad(distance, X_adv)[0]
        X_adv = project(X_adv.detach() + alpha * slope.sign(), X, epsilon)
    return X_adv


embed = model[:-1]


def moved(X_adv):
    with torch.no_grad():
        return (embed(X_adv) - embed(X_valid)).norm(dim=1).mean().item()


def reads_changed(X_adv):
    with torch.no_grad():
        return (model(X_adv).argmax(dim=1) != model(X_valid).argmax(dim=1)).float().mean().item()


torch.manual_seed(0)
for epsilon in [0.1, 0.15, 0.2]:
    X_adv = push_away(embed, X_valid, epsilon, epsilon / 4, 20)
    X_noisy = project(X_valid + (torch.rand_like(X_valid) * 2 - 1) * epsilon, X_valid, epsilon)
    print(epsilon, round(moved(X_adv), 2), round(reads_changed(X_adv), 3), round(moved(X_noisy), 2), round(reads_changed(X_noisy), 3))
```

With ε = 0.2, the attack moves the embeddings by 5.68 on average, well over the 3.55 that lay between the first 0 and the other 0s, and the network reads 75.4% of the pictures as another digit than before. Random changes of the same size move the embeddings by about 1, and change 2.7% of the readings.

An attack that knows the labels does more with the same ε: PGD left the network 1% at 0.2. But this one never saw a label, and it damages everything that's built on the embedding at once, whether that's a last layer, a search, or a comparison of two pictures. The one sum in `push_away` can be swapped for another to aim it: the distance to the embedding of some other picture, with a step against the slopes, pulls a picture's embedding towards that picture's.

## Summary

- An untargeted attack climbs the loss for the right label. A targeted one goes down the loss for the label it wants, with steps against the signs of the slopes. Reaching a chosen class takes a bigger ε than any mistake does.
- A perturbation is the change that an attack makes, `X_adv - X`. Its L∞ norm is its biggest change of a pixel, and its L2 norm is its length: `delta.abs().max()` and `delta.norm()`.
- Each norm has its ball. In the L2 ball, PGD steps along the slopes, scaled to the length α, and the projection shortens a perturbation that's too long.
- An accuracy under attack means something only with its norm and its ε.
- An embedding can be attacked without labels, by pushing it away from where it was. The slopes are 0 at the picture itself, so this attack needs a random start.

## Check yourself

<details>
<summary>A perturbation changes four pixels by 0.3, −0.4, 0 and 0. What are its L∞ and its L2 norm?</summary>

0.4 and 0.5. The L∞ norm is the biggest change with its sign dropped, 0.4. The L2 norm is the root of the sum of the squares: 0.09 + 0.16 = 0.25, and its root is 0.5.

</details>

<details>
<summary>What changes in PGD's step to make the attack targeted?</summary>

The label and the direction. The loss is worked out for the target, the label that the attacker wants, and the step goes against the signs of its slopes, so that this loss falls: `X_adv - alpha * slope.sign()`. The projection stays as it is.

</details>

<details>
<summary>An attack that pushes an embedding away is started at the picture itself, and returns the picture unchanged. Why?</summary>

The distance between the embedding and itself is 0, the lowest a distance can be, and at a lowest point all the slopes are 0. The sign of 0 is 0, so no pixel moves, at this step or at any after it. A random start inside the ball gives the attack a direction to grow.

</details>

<details>
<summary>One network keeps 60% under "L∞, ε = 0.1", and another 60% under "L2, ε = 0.1", on pictures of 64 pixels. Which one withstood more?</summary>

The first one, by far. In the L∞ ball, every one of the 64 pixels may move by 0.1, which makes perturbations up to 0.8 long. The L2 ball of 0.1 holds only perturbations that are 0.1 long at most. The numbers can't be compared without their norms.

</details>

## Your turn

In [Aim at a class](../../exercises/07-adversarial-examples/03-targets-and-norms/01-aim-at-a-class/task.md), you'll write a targeted PGD. In [Push an embedding away](../../exercises/07-adversarial-examples/03-targets-and-norms/02-push-an-embedding-away/task.md), you'll write the attack that moves a picture's embedding as far as it can from where it was.
