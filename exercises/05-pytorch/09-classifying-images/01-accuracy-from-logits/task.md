---
description: Work out the accuracy of a network's logits against the true classes, as the fraction of the pictures it got right.
---

# Accuracy from logits

[Training](../../../../notes/05-pytorch/09-classifying-images.md#training) measured the network with `torchmetrics.Accuracy`. Finish `accuracy(logits, labels)`, which does the same for one batch, without the library: it returns the fraction of the pictures whose biggest logit belongs to the right class, as a plain Python number. `logits` has the shape `[pictures, classes]`, and `labels` has the shape `[pictures]`, with a class number for each picture.

| Call, with the logits of 4 pictures and 3 classes | Returns |
| ------------------------------------------------- | ------- |
| the classes 0, 2, 2 and 0 are the right ones      | `0.75`  |
| the classes 0, 2, 1 and 0                         | `1.0`   |
| the classes 1, 1, 0 and 1                         | `0.0`   |

The four pictures' biggest logits are in the classes 0, 2, 1 and 0, so the second set of labels gets all 4 right, and the first gets 3: the third picture's best class is 1, and it's labelled 2. [`argmax(dim=1)`](../../../../notes/05-pytorch/09-classifying-images.md#reading-the-answers) picks a class for each picture, comparing two tensors with `==` gives `True` or `False` for each, and the mean of those, once they're numbers, is the fraction that are `True`. `.item()` takes the number out of the tensor.
