---
description: Work out a whole day's fares at once with PyTorch's tensors, and learn the shapes, types and in-place changes that trip up beginners.
---

# Tensors

The [neural network chapter](../04-foundations/04-neural-networks/) did its arithmetic with Python lists, loops and the `math` module. That's fine for three neurons, and hopeless for millions of them. Real models are written with a library that does arithmetic on whole tables of numbers at once, and the most widely used one is **PyTorch**. Its basic object is the **tensor**, and this lesson is a tour of it, with the taxi company's day receipts.

> [!NOTE]
> The code on this page runs in your browser, with a small PyTorch written for this site. For everything the lessons here use, it prints the numbers the real PyTorch prints, and fails with the messages the real one fails with, so what you see here is what you'll see after `pip install torch` on your computer. [How this works](../01-start-here/01-how-this-works.md#pytorch-in-the-page) lists the differences.

## A number, a list, a table

A tensor is a table of numbers, with any number of dimensions. The taxi's day rides come in three sizes:

- a single number, like one fare, is a tensor with 0 dimensions,
- a list of numbers, like the distances of four rides, has 1 dimension,
- a table, with a row for each ride and a column for each fact about it, has 2 dimensions.

```python run
import torch

fare = torch.tensor(15.0)
kms = torch.tensor([2.0, 4.0, 6.0, 8.0])
rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(fare)
print(kms)
print(rides)
print(fare.shape, kms.shape, rides.shape)
print(rides.ndim, rides.numel())
```

A tensor prints as `tensor(...)`, with a point after every whole number to show that it's a float. Its **shape** says how many numbers it has along each dimension: `[4, 2]` is 4 rows and 2 columns, so here 4 rides, each with 2 numbers, the distance and the minutes the taxi waited. A single number has no dimensions to count along, so `fare.shape` is empty. `ndim` is the number of dimensions, and `numel()` how many numbers the tensor holds in all: 8 for `rides`.

## Types

Every tensor holds numbers of one type, its `dtype`. Numbers with a point become `float32`, 32-bit floats, and whole numbers become `int64`. Dividing whole numbers gives floats, as it does in Python, and `dtype=` and `.float()` pick the type yourself:

```python run
import torch

print(torch.tensor([2.0, 4.0]).dtype)
print(torch.tensor([2, 4]).dtype)
print(torch.tensor([2, 4], dtype=torch.float32))
print(torch.tensor([2, 4]) / 2)
print(torch.tensor([2, 4]).float())
```

Python's own floats have 64 bits. A neural network doesn't need that many, because its weights are only ever known roughly, and 32 bits take half the memory and are faster. So 32 bits is PyTorch's default, and the type to ask for when you convert numbers that come with 64.

## Arithmetic on every number

An operator on a tensor works on each of its numbers. The sticker's rule, €3 for every kilometer plus €8 to start, takes one line for all four rides, and no loop:

```python run
import torch

kms = torch.tensor([2.0, 4.0, 6.0, 8.0])

fares = kms * 3 + 8
print(fares)
print(kms ** 2)
print(kms.exp())
print(kms.mean(), kms.sum(), kms.max())
print(fares[0], fares[0].item(), fares.tolist())
```

`mean()`, `sum()` and `max()` squeeze the whole tensor into one number, which is itself a tensor with 0 dimensions. `.item()` takes the number out as a plain Python one, and `.tolist()` turns a whole tensor into lists.

## Along a dimension

Give a method a `dim`, and it works along that dimension instead of over everything. The dimension you name is the one that disappears: `dim=0` collapses the rows, leaving a number for each column, and `dim=1` collapses the columns, leaving a number for each row.

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(rides.sum(dim=0))
print(rides.sum(dim=1))
print(rides.mean(dim=0))
print(rides.max(dim=0))
```

The first line is the total kilometers and the total minutes of waiting, and the third the average ride: 5 km, and 4 minutes of waiting. The second adds the two numbers of each ride, which isn't worth knowing for kilometers and minutes, but shows the direction. `max(dim=0)` gives two things: the biggest number in each column, and the row it's in, which is 3 for the 8 km ride and 1 for the 6 minutes of waiting. They're also in `.values` and `.indices`.

## Matrix multiplication

With the waiting, a fare is $3 \times \text{km} + 0.5 \times \text{minutes} + 8$: a ride's two numbers are multiplied by the two prices, and the products are added up. That's the **dot product** from [More inputs: vectors](../04-foundations/02-linear-regression/03-training.md#more-inputs-vectors), and a table times a vector does it for every row at once. The operator is `@`, and `.T` swaps the rows and columns of a table:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
prices = torch.tensor([3.0, 0.5])

print(rides @ prices)
print(rides @ prices + 8)
print(rides.T)
print(rides.T.shape)
```

The second line has the fares of the day receipts from [Making predictions](../04-foundations/02-linear-regression/01-predictions.md): 15, 23, 29 and 33. A matrix product only works when the last dimension of the left tensor is as long as the first one of the right tensor: `[4, 2] @ [2]` is fine, and gives `[4]`. Give it a price for a third column that doesn't exist, and PyTorch says what doesn't fit:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
prices = torch.tensor([3.0, 0.5, 1.0])

print(rides @ prices)
```

"mat (4x2)" is `rides`, and "vec (3)" is `prices`, which has 3 numbers for rows of 2.

## Picking out numbers

Square brackets pick out a part of a tensor, as they do in a list, with a comma between the dimensions. A `:` stands for all of a dimension, and a condition keeps the rows or numbers it's true for:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(rides[0])
print(rides[0, 1])
print(rides[:, 0])
print(rides[1:3])
print(rides[:, 0] > 4)
print(rides[rides[:, 0] > 4])
```

`rides[:, 0]` is column 0 of every row: the distances. `rides[:, 0] > 4` is a tensor of `True` and `False`, one for each ride, and putting it in the brackets keeps the rides that are longer than 4 km.

## Changing a tensor in place

A part of a tensor, like `rides[0]`, isn't a copy: it's a **view**, a window on the same numbers, so changing one changes the other. `.clone()` makes a copy of its own. And a method with an underscore at the end of its name, like `relu_()`, changes the tensor it's called on instead of giving a new one:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

first = rides[0]
first[0] = 100
print(rides)

copy = rides.clone()
copy[:, 1] = 0
print(copy)
print(rides)

x = torch.tensor([-1.0, 2.0, -3.0])
x.relu_()
print(x)
```

Setting `first[0]` to 100 changed the first ride in `rides` too, because `first` is a window on it. `copy` is a tensor of its own, so zeroing its second column left `rides` as it was. `relu` is the activation function from [ReLU](../04-foundations/04-neural-networks/01-layers.md#relu), and `x.relu_()` turned the negative numbers of `x` into 0 where they were.

## NumPy and PyTorch

NumPy arrays turn into tensors and back. `torch.tensor(array)` copies the numbers, `torch.from_numpy(array)` shares them, like a view does, and `.numpy()` gives a tensor's numbers as an array:

```python run
import numpy as np
import torch

numbers = np.array([[1.0, 2.0], [3.0, 4.0]])

print(torch.tensor(numbers).dtype)
print(torch.tensor(numbers, dtype=torch.float32).dtype)

shared = torch.from_numpy(numbers)
numbers[0, 0] = 99.0
print(shared)
print(shared.numpy())
```

NumPy's floats have 64 bits, so a tensor made from an array of them has too, unless you ask for `dtype=torch.float32`.

> [!NOTE]
> NumPy's whole numbers have 32 bits in the browser, and usually 64 on a computer. So in this page, `torch.tensor(np.array([1, 2, 3]))` is an `int32` tensor, and on your computer, an `int64` one. Say which you want, with `dtype=torch.int64`, and the code works the same in both places.

## Random numbers

`torch.rand` makes numbers between 0 and 1, and `torch.randn` numbers that cluster around 0, as in a bell curve. A model starts from random weights, and `torch.manual_seed` fixes the numbers, so that the same code gives the same numbers every time. The page makes them the way PyTorch does, so these are the very numbers you get on any computer:

```python run
import torch

torch.manual_seed(42)
print(torch.rand(3))
print(torch.randn(2, 2))
print(torch.zeros(2, 3))
print(torch.ones(3))
print(torch.arange(5))
print(torch.linspace(0, 1, 5))
```

`zeros` and `ones` make a tensor of the shape you give them, filled with 0 or with 1, `arange` counts like `range`, and `linspace(0, 1, 5)` puts 5 numbers at equal distances from 0 to 1.

## Broadcasting: standardizing the columns

[Standardizing the inputs](../04-foundations/04-neural-networks/04-inputs.md#standardizing-the-inputs) takes an input's average away, and divides by its spread. For a table, that's one average and one spread for each column, each taken from the whole of its column:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

means = rides.mean(dim=0, keepdim=True)
stds = rides.std(dim=0, keepdim=True, correction=0)
print(means)
print(stds)
print((rides - means) / stds)
```

`means` has the shape `[1, 2]`, and `rides` `[4, 2]`. Tensors of different shapes can still be added, subtracted or multiplied, as long as each dimension either has the same size in both, or is 1 in one of them. The 1 is **broadcast**: stretched, as if it were copied as many times as needed. So `rides - means` takes the same 2 averages away from every one of the 4 rows.

`keepdim=True` keeps the dimension that `mean` collapsed, as a 1, so that the shape of `means` is `[1, 2]`, and not `[2]`. For columns, both would broadcast, but for rows, only the one that keeps the dimension does. Without it, the 4 averages have the shape `[4]`, which lines up with the *last* dimension of `rides`, the one with 2 numbers, and PyTorch refuses:

```python run
import torch

rides = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])

print(rides.mean(dim=1, keepdim=True).shape)
print(rides - rides.mean(dim=1, keepdim=True))
print(rides - rides.mean(dim=1))
```

`std` has to be told `correction=0` to work out the spread the way the lessons do, by dividing by the number of rides. By default, it divides by one less, $n - 1$, which is what you want when the numbers are a sample of a bigger crowd, and gives 2.58 instead of 2.24 for the distances here.

## Summary

- A tensor is a table of numbers, with a **shape** that says how many it has along each dimension. All of its numbers have one type, its `dtype`: `float32` for numbers with a point, and `int64` for whole numbers.
- Operators work on every number. A method with a `dim` collapses that dimension, and `@` is the matrix product, which needs the last dimension of the left tensor to be as long as the first one of the right tensor.
- Square brackets pick out numbers, rows and columns, and give views that share their numbers with the original. `clone()` makes a copy, and a method that ends with `_` changes a tensor in place.
- Tensors of different shapes can be combined when each pair of dimensions is equal, or one of them is 1: that one is broadcast. `keepdim=True` helps the shapes fit.
- `std` divides by one less than the number of items, unless it's told `correction=0`.

## Check yourself

<details>
<summary>What shape does <code>torch.zeros(3, 4).sum(dim=0)</code> have?</summary>

`[4]`. `dim=0` is the dimension that disappears, and the 3 rows are added up into one, so a number is left for each of the 4 columns.

</details>

<details>
<summary>Why does <code>torch.tensor([1, 2, 3]) / 2</code> print <code>tensor([0.5000, 1.0000, 1.5000])</code>, and not whole numbers?</summary>

Dividing gives floats, as `1 / 2` does in Python, and the floats of a tensor are `float32` numbers. The tensor on the left holds `int64` numbers, and PyTorch turns them into floats before it divides.

</details>

<details>
<summary>You make <code>b = a[:, 0]</code>, and then <code>b[0] = -1</code>. Did <code>a</code> change?</summary>

Yes. `a[:, 0]` is a view of the first column, not a copy, so `b[0]` and `a[0, 0]` are the same number. `a[:, 0].clone()` would have been a copy of its own.

</details>

## Your turn

In [Fares for every ride](../../exercises/05-pytorch/01-tensors/01-fares-for-every-ride/task.md), you'll work out the fares of a whole day with one line of tensor arithmetic. In [Standardize the columns](../../exercises/05-pytorch/01-tensors/02-standardize-the-columns/task.md), you'll standardize a table, using what you know about dimensions and broadcasting.
