# Tensors

## `rides` has the shape `[4, 2]`. What does `rides.sum(dim=1)` give?

- [x] A tensor of shape `[4]`: the numbers of each ride added up
- [ ] A tensor of shape `[2]`: the numbers of each column added up
- [ ] A tensor of shape `[4, 1]`
- [ ] A single number: everything added up

The dimension you name is the one that disappears. `dim=1` is the columns, so the 2 numbers of each row become 1, and what's left is a number for each of the 4 rides. `dim=0` would have added up the rows, and given `[2]`, and `.sum()` with no `dim` gives one number for the whole table.

## What's the `dtype` of `torch.tensor([1, 2, 3])`?

- [x] `torch.int64`
- [ ] `torch.float32`
- [ ] `torch.float64`
- [ ] `torch.int32`

Whole numbers make an `int64` tensor. A point, as in `torch.tensor([1.0, 2.0, 3.0])`, makes it `float32`, PyTorch's default float. `float64` is what NumPy gives for floats, and `int32` is only used when it's asked for.

## What does `a` hold after `a = torch.tensor([1.0, 2.0, 3.0])`, `b = a[:2]` and `b[0] = 10`?

- [x] `tensor([10., 2., 3.])`
- [ ] `tensor([1., 2., 3.])`
- [ ] `tensor([10., 2.])`
- [ ] `tensor([10., 10., 10.])`

`a[:2]` is a view: a window on the first two numbers of `a`, not a copy of them. Changing `b[0]` changes the number they share. `b.clone()` would have been a copy that leaves `a` alone.

## Which of these raises an error?

- [x] `torch.ones(4, 2) - torch.ones(4)`
- [ ] `torch.ones(4, 2) - torch.ones(2)`
- [ ] `torch.ones(4, 2) - torch.ones(4, 1)`
- [ ] `torch.ones(4, 2) - torch.ones(1, 2)`

PyTorch lines the shapes up from the right, and each pair of dimensions has to be equal, or one of them has to be 1. `[4]` lines up with the 2 columns, and 4 isn't 2. The other three have a 2 under the 2, and a 1 or a 4 against the 4, so they broadcast.

## `rides` has the shape `[4, 2]`. What's the shape of `rides @ torch.tensor([3.0, 0.5])`?

- [x] `[4]`
- [ ] `[2]`
- [ ] `[4, 2]`
- [ ] It's an error, because the shapes are different

The last dimension of the left tensor, 2, is as long as the first (and only) dimension of the right one, so they fit. Each of the 4 rows is multiplied by the 2 prices and added up, and that gives a fare for each ride: `[4]`.

## In the lesson, `std(dim=0, keepdim=True)` gave 2.58 and not 2.24 for the distances, until `correction=0` was added. Why?

- [x] By default, it divides by one less than the number of rides, not by the number of rides
- [ ] By default, it works on the rows, not on the columns
- [ ] By default, it works with 16-bit numbers
- [ ] By default, it adds the average instead of taking it away

The spread of the lessons averages the squared distances from the average, so it divides by the number of rides, 4. PyTorch's `std` divides by 3 by default, which is the right thing for numbers that are a sample of a bigger crowd, and gives a bigger spread. `correction=0` makes it divide by 4.
