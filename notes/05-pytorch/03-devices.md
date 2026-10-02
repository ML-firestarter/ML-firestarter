---
description: Find out where PyTorch can run your tensors, a processor or a graphics card, write code that picks the best one, and move tensors to it.
---

# Devices

Working out a prediction for a few taxi rides takes no time at all. Training a network on millions of them takes hours, unless the arithmetic runs on a **graphics card**, a GPU, which does thousands of small calculations at once. PyTorch can run tensors on one, and the only thing it asks for is that you say where each tensor lives. This lesson is about saying it.

> [!NOTE]
> This page has no graphics card, so everything here runs on the processor, the **CPU**. The code is written the way you'd write it for a computer with a GPU, and on one, the same code runs there with no change. [PyTorch in the page](../01-start-here/01-how-this-works.md#pytorch-in-the-page) says what else is different.

## Where a tensor lives

Every tensor has a `device`: `cpu` for the processor, `cuda` for an NVIDIA graphics card, and `mps` for the graphics chip of an Apple computer. A new tensor lives on the CPU, unless you say otherwise:

```python run
import torch

M = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
print(M.device)
print(M.device.type)
print(torch.device("cpu"))
```

## Picking a device

Which devices a computer has, you can ask PyTorch. The usual way to pick one is to take a graphics card when there is one, and the processor when there isn't, so that the same code runs everywhere:

```python run
import torch

if torch.cuda.is_available():
    device = "cuda"
elif torch.backends.mps.is_available():
    device = "mps"
else:
    device = "cpu"

print(device)
```

Here it prints `cpu`, and on a computer with an NVIDIA card, `cuda`. Write this once, near the top of a program, and use `device` everywhere after it, and nothing else in the program has to know what the computer has.

## Moving tensors

`.to(device)` gives a copy of a tensor on the device, and `device=` makes a tensor on it from the start. Operations happen where their tensors live, and their results live there too:

```python run
import torch

device = "cpu"

M = torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
M = M.to(device)
print(M.device)

N = torch.tensor([[9.0, 8.0, 7.0], [6.0, 5.0, 4.0]], device=device)
R = N @ N.T
print(R.device)
print(R)
```

On a GPU, the second `M` and `N` would live on the graphics card, and so would `R`, worked out there. `.to` also changes the type: `M.to(torch.float64)` keeps the device and changes the `dtype`, and `M.to("cpu", torch.float64)` does both.

Two tensors have to live on the same device to be used together. Add one from the CPU to one from the GPU, and PyTorch stops with an error that says it found tensors on two devices. So a whole model goes to the device once, `model.to(device)`, as [the next lessons](04-linear-regression-by-hand.md) do, and so does every batch of data, just before the model uses it. A tensor that goes back to the processor, to be printed or turned into a NumPy array, is moved with `.cpu()`.

> [!NOTE]
> Asking for a device the computer doesn't have, like `device="cuda"` here, is an error. It's the reason for checking `is_available()` first.

## Summary

- A tensor lives on a device: `cpu`, `cuda` (an NVIDIA graphics card) or `mps` (an Apple one). New tensors live on the CPU.
- Pick the device once, with `torch.cuda.is_available()` and `torch.backends.mps.is_available()`, and use it everywhere.
- `.to(device)` gives a copy on the device, `device=` makes a tensor there, and results live where their tensors do.
- Tensors that are used together have to live on the same device.

## Check yourself

<details>
<summary>Why not write <code>device = "cuda"</code> and be done with it?</summary>

On a computer with no NVIDIA card, every tensor made on `"cuda"` raises an error, so the program only runs on computers like yours. Checking `is_available()` lets the same code use a graphics card where there is one, and the CPU where there isn't.

</details>

<details>
<summary><code>a</code> lives on the GPU and <code>b</code> on the CPU. What does <code>a + b</code> do?</summary>

It stops with an error about two devices. PyTorch never moves tensors behind your back: move one of them, `b.to(a.device)`, and the sum is worked out where `a` is.

</details>

<details>
<summary>You made <code>W</code> with <code>device="cuda"</code> and <code>y = W @ x</code>. On which device is <code>y</code>?</summary>

On `cuda`, as long as `x` is there too. An operation is worked out where its tensors live, and its result stays there.

</details>

## Your turn

In [Pick the device](../../exercises/05-pytorch/03-devices/01-pick-the-device/task.md), you'll write the choice of a device for any computer. In [Move a batch](../../exercises/05-pytorch/03-devices/02-move-a-batch/task.md), you'll move all the tensors of a batch to a device.
