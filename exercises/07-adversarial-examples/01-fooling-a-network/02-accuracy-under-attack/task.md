---
description: Measure a network's accuracy on pictures that were each attacked with FGSM, for several values of ε.
---

# Accuracy under attack

[Accuracy under attack](../../../../notes/07-adversarial-examples/01-fooling-a-network.md#accuracy-under-attack) showed how the accuracy of the network that reads digits falls as ε grows. Finish two functions that measure it for any network:

- `accuracy(model, X, y)` returns the fraction of the pictures in `X` that the model reads right, as a float from 0 to 1. The class that the model reads is the one with the biggest logit, and `.item()` turns a tensor that holds one number into a float.
- `accuracy_under_attack(model, X, y, epsilons)` returns a dictionary with an accuracy for each ε in `epsilons`: the accuracy on the pictures that `fgsm` makes out of `X` with that ε.

`fgsm` is written for you. So are `darkest_pixel()`, the network of [One step with FGSM](../01-one-step-with-fgsm/task.md), which says which of the four pixels of a 2×2 picture is the darkest, and eight pictures for it, `X`, with their labels, `y`:

| Call, with `model = darkest_pixel()`                             | Returns                                                        |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `accuracy(model, X, y)`                                          | `0.875`                                                        |
| `accuracy_under_attack(model, X, y, [0.0, 0.05, 0.1, 0.2, 0.3])` | `{0.0: 0.875, 0.05: 0.75, 0.1: 0.625, 0.2: 0.375, 0.3: 0.125}` |
| `accuracy_under_attack(model, X, y, [0.4])`                      | `{0.4: 0.0}`                                                   |

The network reads 7 of the 8 pictures right: in the last one, the darkest pixel isn't the one that the label names. For this network, FGSM takes ε off the labelled pixel and adds ε to the others, so a picture is read wrong once 2ε is more than the gap between its darkest pixel and the next one. The gaps of the seven pictures go from 0.05 to 0.7, and so the accuracy falls a step at a time.

The code you start from measures the pictures as they are, for every ε: it never attacks them. Two things to watch once it does:

- Every ε attacks the pictures that the function was given, `X`, and not the pictures that came out of the ε before it.
- The attack needs slopes, so it can't run inside `torch.no_grad()`: there, `fgsm` stops with "element 0 of tensors does not require grad and does not have a grad_fn". Measuring the accuracy needs no slopes, and that's the part to put inside it.
