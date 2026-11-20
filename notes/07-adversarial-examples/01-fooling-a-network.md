---
description: Move every pixel of a picture a little, along the sign of the loss's slope, and the network reads it wrong. FGSM, the ε-ball, pixels that stay valid, and accuracy under attack.
---

# Fooling a network

The taxi company's drivers hand in their receipts handwritten, and the network of [Classifying images](../05-pytorch/09-classifying-images.md) reads the digits on them. It reads 94% of them right. That was measured on pictures that nobody had touched, though, and a driver who'd like a fare read as more than it was has every reason to touch one.

This lesson changes a picture on purpose: every pixel by a little, too little to change what a person reads in it, and each in the direction that hurts the network the most. A picture changed like that is called an **adversarial example**, and making one is called an **attack**. The company attacks its own network here, because that's the only way to find out how far to trust it.

## The network

Every example of this chapter starts with the same lines. They load the digits and train the network, as in [Classifying images](../05-pytorch/09-classifying-images.md#reading-the-answers), and keep the 297 validation pictures and their labels in `X_valid` and `y_valid`. They take a second or so. What's new in each example comes after `model.eval()`:

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


with torch.no_grad():
    accuracy = (model(X_valid).argmax(dim=1) == y_valid).float().mean().item()
print(round(accuracy, 3))

picture, label = X_valid[:1], y_valid[:1]
print(picture.shape, label)
for row in as_text(picture[0, 0]):
    print(row)
with torch.no_grad():
    probabilities = F.softmax(model(picture), dim=1)
print([round(p, 2) for p in probabilities[0].tolist()])
```

The network reads 94.3% of the validation pictures right. `X_valid[:1]` is the first of them, as a batch of one picture: the shape is `[1, 1, 8, 8]`, because the network and the loss take batches. `as_text` turns a picture into 8 lines of text, with a character for each pixel, from a space for a light one, under 0.2, to a `#` for a dark one, over 0.8. The picture is a 0. The last line has the network's probabilities for the ten digits: 0.98 for a 0, and 0.01 for a 9.

## The slope for a picture

[The slope for an input](../05-pytorch/02-autograd.md#the-slope-for-an-input) moved a ride along the slopes of the loss, and the fare line's loss went up, with the prices left as they were. A picture is an input of 64 numbers, and the loss has a slope for each of them. `clone()` makes a copy of the picture, so that the mark goes on the copy and the validation pictures stay as they are:

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

picture = X_valid[:1].clone().requires_grad_()
label = y_valid[:1]

loss = criterion(model(picture), label)
slope = torch.autograd.grad(loss, picture)[0]
print(loss)
print(slope.shape)
for row in slope[0, 0]:
    print("".join("+" if number > 0 else "-" for number in row))
```

The loss is 0.016, as low as it is because the network is nearly sure of its 0. The slope has the shape of the picture, with a number for every pixel. A `+` is a pixel whose slope is positive: making it darker raises the loss, so the network gets less sure of the 0. A `-` is a pixel that does that by getting lighter.

Compare the signs with the picture. In the four middle rows, the left side of the ring is `-` everywhere, and the hole next to it has a `+` in every row. A fainter ring with something in its hole is less of a 0. Nobody told the network that: it's in the slopes.

## One step along the sign

The attack moves every pixel by the same small amount, called ε, epsilon: up where the slope is positive, and down where it's negative. That's one step of gradient descent turned around, to climb the loss, and with only the sign of each slope kept. The slopes for all the pixels together are the gradient of the loss for the picture, so this is called the **fast gradient sign method**, or **FGSM**. Here it is with ε = 0.1, a tenth of the way from white to black:

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


original, label = X_valid[:1], y_valid[:1]
picture = original.clone().requires_grad_()
loss = criterion(model(picture), label)
slope = torch.autograd.grad(loss, picture)[0]

epsilon = 0.1
attacked = (original + epsilon * slope.sign()).clamp(0, 1)

with torch.no_grad():
    new_loss = criterion(model(attacked), label)
    probabilities = F.softmax(model(attacked), dim=1)
print(round(loss.item(), 3), round(new_loss.item(), 3))
print([round(p, 2) for p in probabilities[0].tolist()])
for before, after in zip(as_text(original[0, 0]), as_text(attacked[0, 0])):
    print(before, "  ", after)
print((attacked - original).abs().max())
```

The loss went from 0.016 to 1.194. The network now gives a 0 the probability 0.30, and a 9 gets 0.52: it reads the receipt's 0 as a 9. The two pictures are next to each other, the driver's on the left and the attacked one on the right. Some characters differ, where a pixel crossed from one of the five levels to the next, but both are plainly a 0. No pixel moved by more than 0.1, as the last line says. `clamp(0, 1)` is there to keep the pixels between 0 and 1, and the next section comes back to it.

Why the sign, and not the slope itself, as in gradient descent? Because of how the change is limited: every pixel may move by ε, and no further. For a small change, the loss rises by about the slope times the change, for each pixel, added up over the pixels. With a limit on each pixel, the sum is biggest when every pixel goes as far as it may, in the direction of its own slope, and that's ε times the sign. A pixel with a small slope adds only a little, but all 64 little bits point the same way, up the loss, and they add up. A photo has thousands of times as many pixels to add up, which is why a far smaller ε is enough to fool a network that reads photos.

## The ε-ball and valid pixels

The attack promises something about the picture it returns: no pixel is further than ε from where it was. All the pictures that keep that promise make up the **ε-ball** around the original picture. The biggest change of any pixel is how far apart two pictures are in this sense, and it's called their **L∞ distance**, read "L infinity". [Targets and norms](03-targets-and-norms.md) has other ways of measuring.

A pixel also has to stay a pixel, between 0 and 1. The digits have a lot of white around them, pixels at 0, and a step down from 0 would give −0.1, which no picture file can hold. So the attack ends with `clamp(0, 1)`. Here are four pixels, with the signs of their slopes:

```python run
import torch

pixels = torch.tensor([0.0, 0.5, 0.95, 1.0])
signs = torch.tensor([-1.0, 1.0, 1.0, -1.0])
epsilon = 0.1

moved = pixels + epsilon * signs
print(moved)
attacked = moved.clamp(0, 1)
print(attacked)
print((attacked - pixels).abs())
print((attacked - pixels).abs().max())
```

The first pixel would go to −0.1 and the third to 1.05, and the clamp brings them back to 0 and to 1. So the first pixel doesn't move at all, the third moves by 0.05, and the other two by the whole 0.1. Clamping can only bring a pixel back towards where it started, since it started between 0 and 1, so the picture stays inside the ball: the biggest change is still 0.1.

The ε is what makes the changed picture an adversarial example and not just another picture. With ε = 0.5, an attack could paint a 9 over the 0, and the network would be right to read a 9. The ball has to be small enough that everything in it is still the same digit to a person, and then every picture in it that the network reads differently is a mistake of the network's.

## Accuracy under attack

One fooled picture says little about a network. The measure is its accuracy when every picture is attacked: the **accuracy under attack** for that ε. `fgsm` below attacks a whole batch at once. The loss is the mean over the pictures, and the pixels of a picture change only that picture's part of it, so a single call to `torch.autograd.grad` gives every picture its own slopes. They come out divided by the number of pictures, because of the mean, and `sign()` doesn't mind.

For comparison, the last column changes every pixel by the same ε, up or down at random: `torch.randn_like(X_valid)` gives a tensor of random numbers with the shape of `X_valid`, and their signs are the directions.

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


def fgsm(model, X, y, epsilon):
    X = X.clone().requires_grad_()
    loss = criterion(model(X), y)
    slope = torch.autograd.grad(loss, X)[0]
    return (X.detach() + epsilon * slope.sign()).clamp(0, 1)


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


torch.manual_seed(0)
for epsilon in [0.0, 0.05, 0.1, 0.15, 0.2]:
    X_adv = fgsm(model, X_valid, y_valid, epsilon)
    X_noisy = (X_valid + epsilon * torch.randn_like(X_valid).sign()).clamp(0, 1)
    print(epsilon, round(accuracy(model, X_adv, y_valid), 3), round(accuracy(model, X_noisy, y_valid), 3))
```

With ε = 0, nothing changes, and the accuracy is the 94.3% of before. At 0.05, the network reads 81.5% of the attacked pictures, at 0.1, 55.9%, and at 0.2, 4%. That's fewer than the 10% it would get by guessing: the attack doesn't confuse the network, it leads it to wrong answers.

Random changes of the same size hardly matter: at ε = 0.1, the network still reads 91.6% of those pictures. So it isn't the size of the change that fools the network. It's the direction, and the slopes say which one it is.

A network that keeps its accuracy under attack is called **robust**, and this one isn't. Nothing in its training asked it to be: it was only ever shown pictures as they were.

> [!NOTE]
> The attack used the network's own weights to work out the slopes. Keeping the weights secret isn't a defence to count on, though: pictures made against one network often fool another one that was trained on the same kind of pictures.

## Summary

- An adversarial example is a picture changed a little, on purpose, so that a network reads it wrong while a person reads the same as before.
- The loss has a slope for every pixel: `torch.autograd.grad(loss, X)[0]`, for pictures marked with `requires_grad_()`.
- FGSM, the fast gradient sign method, takes one step: `X + epsilon * slope.sign()`. Every pixel moves by ε, in the direction that raises the loss.
- The ε-ball around a picture holds the pictures whose pixels are all within ε of it. The biggest change of a pixel is the L∞ distance. `clamp(0, 1)` keeps the pixels valid, and the picture stays in the ball.
- Accuracy under attack is the accuracy on pictures that were each attacked, for a given ε. Random changes of the same size do next to nothing: the direction is what counts.

## Check yourself

<details>
<summary>A pixel is at 0.95 and its slope is positive. Where is it after FGSM with ε = 0.1?</summary>

At 1. The step takes it to 1.05, and `clamp(0, 1)` brings it back to 1, the darkest a pixel can be. It moved by 0.05, less than ε, so the picture is still inside the ε-ball.

</details>

<details>
<summary>Why does FGSM move a pixel with a tiny slope as far as one with a big slope?</summary>

Because the limit is on each pixel: none may move by more than ε. Under that limit, the loss rises the most when every pixel goes all the way in its own direction. The pixel with the tiny slope adds little, but it adds it in the right direction, and it costs the others nothing.

</details>

<details>
<summary>Random changes of ±0.1 leave the accuracy at 92%, and FGSM with ε = 0.1 takes it to 56%. Both move every pixel by 0.1. What's the difference?</summary>

The direction. With random signs, about half of the pixels push the loss up and half push it down, and they mostly cancel out. FGSM takes each sign from the slope, so every pixel pushes the loss up.

</details>

<details>
<summary>Why isn't a picture attacked with ε = 0.5 an adversarial example?</summary>

A change of half the way from white to black can turn the digit into another one, for a person too, and then the network that reads the other digit is right. An adversarial example keeps its meaning for a person, and that's what a small ε is for.

</details>

## Your turn

In [One step with FGSM](../../exercises/07-adversarial-examples/01-fooling-a-network/01-one-step-with-fgsm/task.md), you'll write the attack for any network and any batch of pictures. In [Accuracy under attack](../../exercises/07-adversarial-examples/01-fooling-a-network/02-accuracy-under-attack/task.md), you'll measure how a network's accuracy falls as ε grows.
