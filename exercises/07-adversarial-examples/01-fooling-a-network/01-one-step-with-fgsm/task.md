---
description: Write FGSM for any network and any batch of pictures, with one step of ε along the sign of the slope, and pixels that stay valid.
---

# One step with FGSM

[One step along the sign](../../../../notes/07-adversarial-examples/01-fooling-a-network.md#one-step-along-the-sign) fooled the network that reads digits. Write the attack as a function that works for any network:

- `fgsm(model, X, y, epsilon)` returns the pictures of `X` after the attack: every pixel moved by `epsilon` in the direction of the sign of its slope, and then clamped so that it stays between 0 and 1. The slopes are those of the loss, `criterion(model(X), y)`, for the pictures.

`X` is a batch of pictures, of the shape `[pictures, 1, height, width]`, and `y` has the class of each. The function returns plain numbers, a tensor that doesn't require grad. It leaves what it was given as it found it: no mark on `X`, and nothing in the `.grad` of the model's parameters.

The pictures here have 2×2 pixels, so that you can check the attack by hand. `darkest_pixel()`, which is written for you, makes a network that says which of a picture's four pixels is the darkest: its four logits are the four pixels, each times 4. To make it less sure of a pixel, that pixel has to get lighter, and the other three darker:

| `X`, one picture             | `y` | `epsilon` | `fgsm` returns              |
| ---------------------------- | --- | --------- | --------------------------- |
| `[[0.9, 0.2], [0.4, 0.1]]`   | `0` | `0.1`     | `[[0.8, 0.3], [0.5, 0.2]]`  |
| `[[0.9, 0.2], [0.4, 0.1]]`   | `0` | `0.3`     | `[[0.6, 0.5], [0.7, 0.4]]`  |
| `[[0.3, 0.95], [1.0, 0.5]]`  | `2` | `0.1`     | `[[0.4, 1.0], [0.9, 0.6]]`  |
| `[[0.05, 0.0], [0.02, 0.0]]` | `0` | `0.1`     | `[[0.0, 0.1], [0.12, 0.1]]` |
| `[[0.9, 0.2], [0.4, 0.1]]`   | `0` | `0.0`     | `[[0.9, 0.2], [0.4, 0.1]]`  |

With ε = 0.3, in the second row, the third pixel ends up the darkest, and the network reads the picture wrong. In the third row, the pixel at 0.95 stops at 1, and in the fourth, the one at 0.05 stops at 0. The checks also use `small_network()`, a network with a hidden layer and random weights, whose slopes can't be guessed, and batches of three pictures, each with a label of its own.

One check looks at what a call left behind, as `[result.requires_grad, X.requires_grad, the .grad of each parameter, the requires_grad of each parameter]`, which should be `[False, False, [None, None], [True, True]]`:

- If the result requires grad, it's still part of the computation that made it: `detach()` gives its numbers alone.
- If `X.requires_grad` is `True`, the function marked the tensor it was given, and not a copy of it: `X.clone()` is a copy.
- If there are tensors where the two `None` should be, the slopes came from `backward()`, which fills the `.grad` of everything that's marked. `torch.autograd.grad` returns only the slope it's asked for.
- If a parameter's `requires_grad` is `False`, the function froze the model and left it frozen, and its owner can't train it any more.
