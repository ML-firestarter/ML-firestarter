---
description: Turn a picture of whole numbers, with its channels last, into the tensor of floats a network takes, and back.
---

# A picture as a tensor

[A picture as a tensor](../../../../notes/05-pytorch/01-tensors.md#a-picture-as-a-tensor) turned a picture as files keep it into what PyTorch's layers take, and back. Finish the two functions that do it for any picture:

- `to_tensor(picture)` takes a `uint8` tensor of the shape `[height, width, channels]`, with numbers from 0 to 255, and returns a `float32` tensor of the shape `[channels, height, width]`, with numbers from 0 to 1.
- `to_picture(x)` goes the other way: it takes floats of the shape `[channels, height, width]` and returns a `uint8` tensor of the shape `[height, width, channels]`. A number below 0 counts as 0, and one above 1 as 1. The rest are multiplied by 255, and rounded to the nearest whole number.

| Call, with `picture` 1 pixel high and 2 wide, a red pixel `[255, 0, 0]` and a blue-green one `[0, 128, 255]` | Returns                                                         |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `to_tensor(picture)`                                                                                          | `tensor([[[1.0000, 0.0000]], [[0.0000, 0.5020]], [[0.0000, 1.0000]]])` |
| `to_tensor(picture).shape`                                                                                    | `torch.Size([3, 1, 2])`                                         |
| `to_picture(to_tensor(picture))`                                                                              | the same as `picture`                                           |

The tensor has a table for each channel: the red of the two pixels, 1 and 0, then their green, 0 and 0.502, then their blue, 0 and 1.

If the shapes are right and the numbers are in the wrong places, the dimensions were cut again with `reshape`, where they had to be moved with `permute`. If `to_picture` gives 63 where the checks expect 64, the floats were turned into whole numbers without `round()`, which cuts off what's after the point. And if a number above 1 doesn't come out as 255, it wasn't brought back with `clamp` before the conversion.
