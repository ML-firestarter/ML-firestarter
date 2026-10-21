---
description: When a model fits its training data too closely and performs worse on new data.
---

# Overfitting

Overfitting happens when a model learns details or noise specific to its training data rather than patterns that generalize. It can perform well on training examples but poorly on new examples; comparing performance on training and validation sets can reveal it.

**Example:** a network's training loss keeps falling while its validation loss rises, as it learns the random outcomes of its training examples.

**Related:** [Fine-tuning](fine-tuning.md) · [Pretraining](pretraining.md)
