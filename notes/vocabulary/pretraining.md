---
description: The first and biggest training stage, where a model learns to predict the next token across a huge amount of text.
---

# Pretraining

During pretraining a language model reads trillions of [tokens](token.md) of text, such as web pages, books and code, and at every position predicts the next token. The loss (cross-entropy) is low when the model gave high probability to the token that actually came next, and gradient descent lowers it. It's the same idea as in the [linear regression lesson](../02-foundations/02-linear-regression.md), with billions of parameters instead of two.

No one has to label anything, because the text itself supplies the answers. That's why this is called *self-supervised* learning. Predicting text well turns out to require grammar, facts and some reasoning, so the result, a [base model](base-model.md), knows a lot.

For large models it's the most expensive stage: weeks or months on thousands of GPUs.

**Example:** the sentence "The cat sat on the mat" gives several training examples at once: predict "cat" after "The", "sat" after "The cat", and so on (treating each word as one token).

**Related:** [Base model](base-model.md) · [Token](token.md) · [Post-training](post-training.md)
