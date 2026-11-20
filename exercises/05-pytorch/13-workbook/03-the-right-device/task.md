---
description: Pick the device to compute on, and move a batch of any shape to it, with tensors inside tuples, lists and dictionaries.
---

# The right device

*Draws on [Devices](../../../../notes/05-pytorch/03-devices.md) for devices and `.to()`, and [Your own modules](../../../../notes/05-pytorch/08-your-own-modules.md) for batches that are dictionaries.*

Models of several inputs make batches of several kinds: a tensor, a tuple of tensors, or a dictionary of them, even with lists inside. Finish two functions:

- `get_device()` returns `"cuda"` when `torch.cuda.is_available()`, and `"cpu"` when not.
- `to_device(batch, device)` returns the batch with every tensor in it moved to `device`, and with the same structure: a tuple stays a tuple, a list a list, and a dictionary a dictionary with the same keys. They can be nested, like `{"X": [a, b], "y": (c,)}`. A tensor on its own is moved too.

| Call                                                 | Returns                                                  |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `get_device()` in the page, which has no graphics card | `"cpu"`                                                |
| `to_device((a, {"b": b}), "cpu")`                    | a tuple with `a`, and a dictionary with the key `"b"` and `b` |

The function calls itself on every item of a tuple, a list or a dictionary, and moves the tensors it finds. `isinstance(batch, (list, tuple))` says whether a batch is a list or a tuple, and `type(batch)(...)` makes another of the same kind.
