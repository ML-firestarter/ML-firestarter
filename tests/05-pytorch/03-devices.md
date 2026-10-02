# Devices

## Which line makes a program run on a graphics card when the computer has one, and on the processor when it doesn't?

- [x] `device = "cuda" if torch.cuda.is_available() else "cpu"`
- [ ] `device = "cuda"`
- [ ] `device = torch.cuda.is_available()`
- [ ] `device = "cpu" if torch.cuda.is_available() else "cuda"`

`is_available()` says whether PyTorch can use an NVIDIA card, so it decides between the two names. `"cuda"` alone fails on a computer without a card, `is_available()` gives `True` or `False` and not a device, and the last line has the two names the wrong way round.

## On which device does `torch.tensor([1.0, 2.0])` live?

- [x] On the CPU
- [ ] On the GPU, when there is one
- [ ] On whichever device is the fastest
- [ ] It has no device until it's used

A new tensor lives on the CPU, unless `device=` says otherwise. PyTorch doesn't move tensors by itself, and it doesn't look for the fastest device: that's what the program's own choice of `device` is for.

## What does `M.to(device)` do?

- [x] It gives a copy of `M` on `device`
- [ ] It changes `M` so that it lives on `device`
- [ ] It makes `M` require grad on `device`
- [ ] It works out `M` on `device`, and keeps it on the CPU

`.to` doesn't change `M`: it gives a tensor on the device, which is why the lesson writes `M = M.to(device)`. On a tensor that already lives there, it gives the tensor itself.

## `a` lives on the GPU, and `b` on the CPU. What does `a + b` do?

- [x] It stops with an error about two devices
- [ ] It moves `b` to the GPU, and works out the sum there
- [ ] It moves `a` to the CPU, and works out the sum there
- [ ] It works out the sum on the CPU and the GPU, and adds them

PyTorch never moves tensors behind your back. Move one of them yourself, like `b.to(a.device)`, and the sum is worked out where they both are.

## You made `W` with `device="cuda"`, and work out `y = W @ x`, where `x` is on `cuda` too. Where does `y` live?

- [x] On `cuda`
- [ ] On the CPU
- [ ] It has no device until it's printed
- [ ] On both

An operation is worked out where its tensors live, and the result stays there. To print it as a NumPy array, it has to come back to the processor first, with `.cpu()`.
