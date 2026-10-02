---
description: Draw hyperparameters at random, a learning rate on a log scale and a layer size, and pick the best of the trials.
---

# Random search

[Tuning hyperparameters](../../../../notes/05-pytorch/10-saving-loading-and-tuning.md#tuning-hyperparameters) drew a learning rate and a layer size at random, and kept the trial that scored best. Finish two functions:

- `draw_settings(generator)` returns the pair `(learning_rate, n_hidden)`. The learning rate is `10 ** (u * 1.5 - 2)`, where `u` is the next number from `torch.rand(1, generator=generator)`, a number between 0 and 1, so the learning rate is between 0.01 and 0.316. `n_hidden` is a whole number from 20 to 100, from `torch.randint(20, 101, (1,), generator=generator)`, drawn after `u`. Both come from the generator that's passed in.
- `best_trial(trials)` returns the best of a list of trials. A trial is a tuple `(score, learning_rate, n_hidden)`, and the best is the one with the highest score. When two have the same score, the one that came first wins.

| Call                                                              | Returns              |
| ----------------------------------------------------------------- | -------------------- |
| `draw_settings(torch.Generator().manual_seed(7))`, the first draw | about `(0.0634, 60)` |
| the second draw from the same generator                           | about `(0.0975, 31)` |
| `best_trial([(0.8, 0.1, 30), (0.9, 0.05, 60), (0.9, 0.2, 40)])`   | `(0.9, 0.05, 60)`    |

Every draw takes numbers from the generator, so the order matters: first the learning rate, then the size. The numbers of a seeded generator are the ones PyTorch makes on your computer too, so the draws above are the ones you'd get there. A tuple's `[0]` is its score.
