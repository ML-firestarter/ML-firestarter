---
description: Work out a whole day's fares at once with PyTorch's tensors, learn the shapes, types and in-place changes that trip up beginners, and turn a picture into a tensor.
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

## Changing the shape

A tensor keeps its numbers in one long row, and its shape says where to cut the row into rows and columns. `reshape` cuts the same numbers another way. Say three days of receipts come as one list of 12 fares, 4 rides a day:

```python run
import torch

fares = torch.tensor([15.0, 23.0, 29.0, 33.0, 12.0, 18.0, 21.0, 40.0, 9.0, 14.0, 26.0, 31.0])

days = fares.reshape(3, 4)
print(days)
print(days.sum(dim=1))
print(fares.reshape(-1, 6).shape)
print(days.flatten())
```

`reshape(3, 4)` makes 3 rows of 4: the first 4 fares are the first day, and the next 4 the second. The order of the numbers doesn't change, only where the rows end, so each day's takings are a sum along its row: 100, 91 and 80. A `-1` stands for whatever fits: with 6 in a row, 12 numbers make 2 rows. `flatten()` goes back to a single row.

The number of numbers has to stay the same. 5 rows of 2 need 10 of them, and there are 12:

```python run
import torch

fares = torch.tensor([15.0, 23.0, 29.0, 33.0, 12.0, 18.0, 21.0, 40.0, 9.0, 14.0, 26.0, 31.0])

print(fares.reshape(5, 2))
```

"Input of size 12" is `fares`, with its 12 numbers.

Reshaping isn't the same as swapping rows and columns. `days.T` and `days.reshape(4, 3)` both have the shape `[4, 3]`, and they hold different tables:

```python run
import torch

fares = torch.tensor([15.0, 23.0, 29.0, 33.0, 12.0, 18.0, 21.0, 40.0, 9.0, 14.0, 26.0, 31.0])
days = fares.reshape(3, 4)

print(days.T)
print(days.reshape(4, 3))

days[0, 0] = 99.0
print(fares[:3])
```

`.T` turns the table, so its first row is the first ride of each day: 15, 12 and 9. `reshape(4, 3)` cuts the same row of 12 numbers after every third one, so its first row is 15, 23 and 29, three rides of one day, and its rows don't mean anything. When a tensor has the right shape and the wrong numbers, this is usually why.

The last two lines show that `reshape` gives a view when it can, like the square brackets do: setting `days[0, 0]` changed `fares`. In other people's code, you'll often see `view` where this lesson has `reshape`. It does the same, but it stops with an error when the numbers would have to be copied, as they are after `.T`, where `reshape` copies them.

## A picture as a tensor

A picture is a table of pixels, and a colour picture has three numbers for each pixel: how much red, green and blue it has, from 0 to 255. Files, and the libraries that read them, keep a picture as `[height, width, channels]`, in whole numbers of the type `uint8`, which holds 0 to 255 and nothing else. Here's a picture of 2 rows of 3 pixels: red, yellow and blue, and under them black, grey and white:

```python run
import torch

picture = torch.tensor(
    [
        [[255, 0, 0], [255, 255, 0], [0, 0, 255]],
        [[0, 0, 0], [128, 128, 128], [255, 255, 255]],
    ],
    dtype=torch.uint8,
)

print(picture.shape, picture.dtype)
print(picture[0, 1])
print(picture[1, 1] + 100)
print(picture[1, 2] + 1)
```

`picture[0, 1]` is the pixel in row 0 and column 1: all of the red, all of the green and no blue, which makes yellow. The last two lines show the trap of `uint8`. The grey pixel plus 100 is 228, as it should be, but white plus 1 is 0: there's no 256 in a `uint8`, so the count starts again from 0, the way a car's odometer goes from 999999 to 000000. Nothing warns you, and a picture that's made brighter by adding to it gets black spots where it was brightest.

PyTorch's layers want something else: floats from 0 to 1, with the channels first, `[channels, height, width]`. `permute` puts the dimensions in a new order: `permute(2, 0, 1)` says that the old dimension 2, the channels, comes first, and then the old 0 and 1, the height and the width. `.float() / 255` turns the whole numbers into floats from 0 to 1:

```python run
import torch

picture = torch.tensor(
    [
        [[255, 0, 0], [255, 255, 0], [0, 0, 255]],
        [[0, 0, 0], [128, 128, 128], [255, 255, 255]],
    ],
    dtype=torch.uint8,
)

x = picture.permute(2, 0, 1).float() / 255
print(x.shape, x.dtype)
print(x[0])
print(picture.reshape(3, 2, 3)[0])
```

`x[0]` is the red channel: a table as high and as wide as the picture, with the red of every pixel. In the first row, the red and the yellow pixel have all of it, and the blue one has none. In the second, black has none, grey has half, and white has all of it. `reshape(3, 2, 3)` gives the same shape and the wrong tensor, as `reshape(4, 3)` did for the days: its first "channel" is the three numbers of the red pixel, and then the three of the yellow one. Moving dimensions around takes `permute`, and `.T` is `permute` for a table, which has only one other order.

On the way back, to save a picture or to show it, the floats become `uint8` again:

```python run
import torch

picture = torch.tensor(
    [
        [[255, 0, 0], [255, 255, 0], [0, 0, 255]],
        [[0, 0, 0], [128, 128, 128], [255, 255, 255]],
    ],
    dtype=torch.uint8,
)
x = picture.permute(2, 0, 1).float() / 255

brighter = (x * 1.5).clamp(0, 1)
back = (brighter * 255).round().to(torch.uint8).permute(1, 2, 0)
print(back.shape, back.dtype)
print(back[1])
print(x.unsqueeze(0).shape)
```

Floats can go past 1 without harm, so the picture is made half as bright again by multiplying, and `clamp(0, 1)` then brings every number that's outside 0 to 1 back to the nearest end. Times 255, `round()` and `.to(torch.uint8)` give whole numbers from 0 to 255 again, and `permute(1, 2, 0)` puts the channels back at the end. The second row is black, a grey of 192 and white: the grey got brighter, and the white stayed white, where `uint8` arithmetic would have wrapped it around.

Both steps before the conversion matter. `.to(torch.uint8)` doesn't round: it cuts off what's after the point, so 63.75 would become 63. And what it makes of a number below 0 or above 255 depends on the computer, so `clamp` comes first.

A network takes many pictures at once, as `[pictures, channels, height, width]`, and `unsqueeze(0)` adds that first dimension to a single picture: `[1, 3, 2, 3]`. [Classifying images](09-classifying-images.md) trains a network on tensors of that shape.

## Summary

- A tensor is a table of numbers, with a **shape** that says how many it has along each dimension. All of its numbers have one type, its `dtype`: `float32` for numbers with a point, and `int64` for whole numbers.
- Operators work on every number. A method with a `dim` collapses that dimension, and `@` is the matrix product, which needs the last dimension of the left tensor to be as long as the first one of the right tensor.
- Square brackets pick out numbers, rows and columns, and give views that share their numbers with the original. `clone()` makes a copy, and a method that ends with `_` changes a tensor in place.
- Tensors of different shapes can be combined when each pair of dimensions is equal, or one of them is 1: that one is broadcast. `keepdim=True` helps the shapes fit.
- `std` divides by one less than the number of items, unless it's told `correction=0`.
- `reshape` cuts the same numbers into another shape, with `-1` for the dimension to work out, and `flatten()` makes them one row. `permute` puts the dimensions in another order. Two tensors can have the same shape, and their numbers in different places.
- A picture comes as `[height, width, channels]` in `uint8`, whole numbers from 0 to 255 that start again from 0 past 255. A network takes `[channels, height, width]` in floats from 0 to 1: `permute(2, 0, 1).float() / 255`, and back with `clamp`, `round`, `.to(torch.uint8)` and `permute(1, 2, 0)`.

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

<details>
<summary>A picture has the shape <code>[4, 6, 3]</code>: 4 pixels high, 6 wide, with 3 channels. What's wrong with <code>picture.reshape(3, 4, 6)</code> for putting the channels first?</summary>

The shape comes out right, `[3, 4, 6]`, and the numbers come out in the wrong places. `reshape` keeps the numbers in their order and only cuts them differently, so its first "channel" is the first 24 numbers: the three colours of the first 8 pixels. `picture.permute(2, 0, 1)` moves the dimensions, and its first channel is the red of every pixel.

</details>

## Your turn

In [Fares for every ride](../../exercises/05-pytorch/01-tensors/01-fares-for-every-ride/task.md), you'll work out the fares of a whole day with one line of tensor arithmetic. In [Standardize the columns](../../exercises/05-pytorch/01-tensors/02-standardize-the-columns/task.md), you'll standardize a table, using what you know about dimensions and broadcasting. In [A picture as a tensor](../../exercises/05-pytorch/01-tensors/03-a-picture-as-a-tensor/task.md), you'll turn a picture into the tensor a network takes, and back.
