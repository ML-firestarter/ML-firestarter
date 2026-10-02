---
description: Work out accuracy, top-2 accuracy and the average confidence of a classifier from its logits.
---

# A classification report

*Draws on [Classifying images](../../../../notes/05-pytorch/09-classifying-images.md) for `argmax`, `softmax` and `topk`, and [Tensors](../../../../notes/05-pytorch/01-tensors.md) for comparing and averaging tensors.*

A classifier gives a row of logits for every example, one for each class. Finish `report(logits, labels)`, where `logits` has the shape `[n, classes]` and `labels` is a tensor of the `n` right classes. It returns a dictionary of three numbers, each rounded to 4 decimals:

- `"accuracy"`: the share of examples whose class with the highest logit is the label.
- `"top2"`: the share of examples whose label is among the two classes with the highest logits.
- `"confidence"`: the average, over the examples, of the highest probability that `softmax` gives.

| Call, with 4 examples of 3 classes                                  | Returns                                                       |
| ------------------------------------------------------------------- | ------------------------------------------------------------- |
| `report(logits, torch.tensor([0, 1, 0, 2]))`                        | `{"accuracy": 0.75, "top2": 1.0, "confidence": 0.7007}`       |
| `report(logits, torch.tensor([2, 2, 2, 2]))`                        | `{"accuracy": 0.25, "top2": 0.5, "confidence": 0.7007}`       |

The confidence doesn't depend on the labels, only on how sure the network is. A network that's very sure and often wrong has a confidence far above its accuracy.
