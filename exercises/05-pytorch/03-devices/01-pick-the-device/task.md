---
description: Choose between a graphics card, an Apple chip and the processor, for any computer, the way a program picks its device.
---

# Pick the device

[Picking a device](../../../../notes/05-pytorch/03-devices.md#picking-a-device) asked PyTorch which devices the computer has, and took the best one. Finish `choose_device(cuda_available, mps_available)`, which makes the choice from two answers that are given to it, so that it can be tried on every kind of computer, including the ones that don't exist here. It returns `"cuda"` when a NVIDIA card is available, else `"mps"` when an Apple chip is, and `"cpu"` when neither is.

`get_device()` is done: it asks PyTorch the two questions and calls `choose_device`.

| Call                          | Returns  |
| ----------------------------- | -------- |
| `choose_device(False, False)` | `"cpu"`  |
| `choose_device(True, False)`  | `"cuda"` |
| `choose_device(False, True)`  | `"mps"`  |
| `choose_device(True, True)`   | `"cuda"` |

A computer with both a NVIDIA card and an Apple chip is rare, but the card goes first. Return the names as text, like `"cuda"`, as `.to(...)` and `device=` take them.
