---
description: Move all the tensors of a batch to a device, keeping the batch a tuple or a list as it was.
---

# Move a batch

A batch of training data is usually several tensors, like the features and the labels, in a tuple or a list, and all of them have to live on the model's device. As [Moving tensors](../../../../notes/05-pytorch/03-devices.md#moving-tensors) says, `.to(device)` gives a copy of one tensor on a device. Finish `to_device(batch, device)`, which returns the tensors of `batch` on `device`, in the same order, in a tuple when `batch` was a tuple, and in a list when it was a list. `device` is a name like `"cpu"`, or a `torch.device`.

| Call                          | Returns                                      |
| ----------------------------- | -------------------------------------------- |
| `to_device((X, y), "cpu")`    | a tuple with `X` and `y`, both on the CPU    |
| `to_device([a, b, c], "cpu")` | a list with `a`, `b` and `c`, all on the CPU |

There's no GPU here, so the checks use `"cpu"`, and look at the numbers, the order and the kind of container. On a computer with a graphics card, `to_device(batch, "cuda")` is what a training loop calls for every batch. If your function gives back a list when it got a tuple, the result of `X, y = to_device((X, y), ...)` still unpacks, but the checks look at the kind.
