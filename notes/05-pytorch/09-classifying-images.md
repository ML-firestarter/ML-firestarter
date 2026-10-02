---
description: Train a network to read handwritten digits, with CrossEntropyLoss on logits, accuracy as the metric, and softmax and top-k to read its answers.
---

# Classifying images

So far, the model predicted a number, a fare. Many models pick one of a few classes instead: which digit is in a picture, which animal, which language. This lesson trains a network to read handwritten digits, and shows what changes when the answer is a class: the labels, the last layer, the loss, and the metric.

> [!NOTE]
> The pictures are scikit-learn's digits, 1,797 images of 8×8 pixels, because the page can't download a bigger set. The code is the same for Fashion-MNIST or any other set of images: only the sizes of the pictures and of the layers change, as the comments below say, and on your computer, `torchvision` has them.

## The pictures

Each image is a grid of 64 pixels, with a number for how dark each is, 0 to 16. A tensor of pictures has the shape `[pictures, channels, height, width]`: a grey picture has 1 channel, a colour one 3. The pixels are divided by 16, to be between 0 and 1. The labels are the digits, 0 to 9, as whole numbers of the type `int64`, called `long`:

```python run
import torch
from sklearn.datasets import load_digits

digits = load_digits()
X = torch.tensor(digits.images, dtype=torch.float32).unsqueeze(1) / 16
y = torch.tensor(digits.target, dtype=torch.long)

print(X.shape, y.shape)
print(y[:10])
for row in X[3, 0]:
    print("".join("#" if pixel > 0.5 else "." for pixel in row))
print(y[3])
```

`unsqueeze(1)` adds the channel dimension, so 1,797 images of `[8, 8]` become `[1797, 1, 8, 8]`. The picture printed is image 3, drawn with `#` for the dark pixels, and its label is the digit it shows.

## A network and its loss

The network is the one of [the last lesson](07-a-network-with-nn-sequential.md), with a new first layer. `nn.Flatten()` turns each picture of `[1, 8, 8]` into a row of 64 numbers, which the `nn.Linear` layers take. The last layer has one output for every class, 10, and these numbers are the **logits**: a score for each digit, as big as the network likes, positive or negative. The biggest logit is the digit the network picks.

`nn.CrossEntropyLoss()` takes the logits and the true classes. It turns the logits into probabilities with the softmax, and the penalty for a picture is $-\ln$ of the probability that the network gave the right digit: the [log loss](../04-foundations/03-logistic-regression/02-error.md) of the logistic regression chapter, for more than two classes. It takes logits, not probabilities, and the labels as `long` class numbers, not floats:

```python run
import torch
import torch.nn as nn
import torch.nn.functional as F

criterion = nn.CrossEntropyLoss()
logits = torch.tensor([[2.0, 0.5, -1.0]])

print(F.softmax(logits, dim=1))
print(criterion(logits, torch.tensor([0])))
print(criterion(logits, torch.tensor([1])))
print(criterion(logits, torch.tensor([0.0])))
```

The softmax turns the three logits into probabilities that add up to 1, and the network gives the first class the most, 0.79. If the true class is 0, the loss is $-\ln 0.79 = 0.24$, and if it's 1, only 0.18 of the probability went to it, and the loss is 1.74. The last line stops, because the label 0.0 is a float, and the loss wants a class number: "expected target dtype to be Long or Byte".

## Training

The training loop is the one of [the batches lesson](06-batches-and-evaluation.md): the optimizer takes a step for each batch of the training pictures, and after each epoch, the validation pictures measure the model. The metric is **accuracy**, the fraction of the pictures whose biggest logit is the right digit, and `torchmetrics.Accuracy` collects it a batch at a time:

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

torch.manual_seed(42)
model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(64, 100),
    nn.ReLU(),
    nn.Linear(100, 50),
    nn.ReLU(),
    nn.Linear(50, 10),
)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
accuracy = torchmetrics.Accuracy(task="multiclass", num_classes=10)

for epoch in range(10):
    model.train()
    total_loss = 0.0
    for X_batch, y_batch in train_loader:
        optimizer.zero_grad()
        loss = criterion(model(X_batch), y_batch)
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    model.eval()
    accuracy.reset()
    with torch.no_grad():
        for X_batch, y_batch in valid_loader:
            accuracy.update(model(X_batch), y_batch)
    print(epoch + 1, round(total_loss / len(train_loader), 4), round(accuracy.compute().item(), 4))
```

The first epoch's loss is about 2.27, close to $-\ln 0.1 = 2.30$, the loss of a network that gives all 10 digits the same probability. After 10 epochs it's 0.20, and the model reads 94% of the validation pictures right. For Fashion-MNIST, only the sizes change: 28 × 28 = 784 inputs in the first layer, and a few hundred hidden numbers instead of 100.

## Reading the answers

The logits are the network's scores, and `argmax` picks the biggest one for each picture: `dim=1` is the dimension of the 10 classes. The softmax turns the scores into probabilities, so that you can see how sure the network is, and `torch.topk` gives the best few classes, with their logits. A softmax over only the top logits gives probabilities among the top few:

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
X_new, y_new = X[valid_set.indices[:3]], y[valid_set.indices[:3]]
with torch.no_grad():
    logits = model(X_new)

print(logits.argmax(dim=1), y_new)
probabilities = F.softmax(logits, dim=1)
print(probabilities.max(dim=1).values.round(decimals=2))
top_logits, top_classes = torch.topk(logits, k=3, dim=1)
print(top_classes)
print(F.softmax(top_logits, dim=1).round(decimals=2))
```

The network gets the three pictures right, 0, 1 and 0, and it's sure of them: the biggest probabilities are 0.98, 0.99 and 1.00. The three best classes of the first picture are 0, 9 and 5, with 0.98, 0.01 and 0.00 among them. The network was never told which digits look alike, but 9 and 5 are its second and third choices for a 0.

## Summary

- A picture tensor is `[pictures, channels, height, width]`, and `nn.Flatten()` makes each picture a row for the linear layers. Labels for classes are whole numbers of the type `long`.
- The last layer of a classifier has one output for each class, and its numbers are the logits.
- `nn.CrossEntropyLoss()` takes logits and class numbers, applies the softmax inside, and gives the log loss. Don't apply a softmax before it.
- Accuracy is the fraction of right pictures, and `torchmetrics.Accuracy` collects it over batches. `argmax(dim=1)` picks the class, `F.softmax` gives probabilities, and `torch.topk` the best few classes.

## Check yourself

<details>
<summary>A network for 5 classes gets a batch of 32 pictures. What shape do its logits have?</summary>

`[32, 5]`: a score for each of the 5 classes, for each of the 32 pictures. `argmax(dim=1)` then gives 32 class numbers.

</details>

<details>
<summary>Why does the last layer of the network have no softmax?</summary>

`CrossEntropyLoss` applies it itself, in a way that's more accurate than a softmax followed by a log. A softmax before it would be applied twice. The softmax is for reading the answers, with `F.softmax`, after training.

</details>

<details>
<summary>The loss of the first epoch is about 2.3. What does it say?</summary>

That the network knows nothing yet: giving all 10 digits the same probability, 0.1, costs $-\ln 0.1 = 2.30$ for every picture. A loss that stays there means that nothing is being learned.

</details>

## Your turn

In [Accuracy from logits](../../exercises/05-pytorch/09-classifying-images/01-accuracy-from-logits/task.md), you'll work out the accuracy of the logits of a batch. In [The best few classes](../../exercises/05-pytorch/09-classifying-images/02-the-best-few-classes/task.md), you'll read the top classes of a network's answers, with their probabilities.
