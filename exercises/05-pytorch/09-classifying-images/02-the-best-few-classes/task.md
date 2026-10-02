---
description: Find the best few classes of every picture, with the probabilities among them.
---

# The best few classes

[Reading the answers](../../../../notes/05-pytorch/09-classifying-images.md#reading-the-answers) took the three best classes of a picture with `torch.topk`, and turned their logits into probabilities with the softmax. Finish `best_classes(logits, k)`, which does it for a whole batch. `logits` has the shape `[pictures, classes]`, and `k` is how many classes to keep. It returns a pair: the class numbers of the `k` best classes of each picture, best first, as a list of lists, and the probabilities among them, a tensor of the shape `[pictures, k]`, from a softmax over the `k` logits only, so that each row adds up to 1.

| Call, with 2 pictures and 4 classes | Returns                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `best_classes(logits, 2)`           | classes `[[0, 3], [3, 2]]`, with about `[[0.731, 0.269], [0.891, 0.109]]` |
| `best_classes(logits, 1)`           | classes `[[0], [3]]`, with `[[1.0], [1.0]]`                               |

The logits are `[[2.0, 0.5, -1.0, 1.0], [0.1, 0.2, 0.9, 3.0]]`, so the best class of the first picture is 0, and its second best is 3. `torch.topk(logits, k=k, dim=1)` gives the biggest `k` logits of each row and their classes, and `.tolist()` turns the classes into lists. A softmax over just the top logits isn't the same as the probability of the whole network's softmax: the first picture's best class has 0.731 among the top 2, and less among all 4.
