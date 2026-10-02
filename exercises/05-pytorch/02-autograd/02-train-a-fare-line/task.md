---
description: Put the four steps of training in a loop, and let autograd find the slopes, to train a fare line on any receipts.
---

# Train a fare line

[Training the fare line](../../../../notes/05-pytorch/02-autograd.md#training-the-fare-line) trained a line on the day receipts, with the loop of four steps. Finish `train(kms, fares, steps, learning_rate)`, which does it for any receipts, and returns the weight and the bias it ends with as the pair `(w, b)`, plain Python numbers. `kms` and `fares` are tensors with a number for each ride.

`train` starts from $w = 0$ and $b = 0$, and takes `steps` steps of gradient descent on the mean squared error. The code already has the parameters and the forward step, the line `loss = ...`. What it needs is the other three steps: `backward()`, the step against the slopes inside `torch.no_grad()`, and the reset of both `.grad`.

`KMS` and `FARES` hold the day receipts.

| Call                            | Returns              |
| ------------------------------- | -------------------- |
| `train(KMS, FARES, 0, 0.02)`    | `(0.0, 0.0)`         |
| `train(KMS, FARES, 1, 0.02)`    | about `(5.6, 1.0)`   |
| `train(KMS, FARES, 2, 0.02)`    | about `(4.28, 0.84)` |
| `train(KMS, FARES, 1500, 0.02)` | about `(3.0, 10.0)`  |

One step from $w = 0$ and $b = 0$ moves them to 5.6 and 1, because the slopes there are −280 and −50, as in [Slopes for a loss](../../../../notes/05-pytorch/02-autograd.md#slopes-for-a-loss), and 0.02 × 280 is 5.6. If the second step doesn't get to `(4.28, 0.84)`, but to something bigger, the slopes were added to the ones of the first step: they have to be set back to 0 after every step, for both parameters. If `train` raises a `RuntimeError` about "a leaf Variable that requires grad", the step is outside `torch.no_grad()`.
