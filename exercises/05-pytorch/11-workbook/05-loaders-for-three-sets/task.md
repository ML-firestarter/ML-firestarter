---
description: Split the rides in three sets, standardize the features with the training set, and make a loader for each.
---

# Loaders for three sets

*Draws on [Tensors](../../../../notes/05-pytorch/01-tensors.md) for slices and standardizing, and [Batches and evaluation](../../../../notes/05-pytorch/06-batches-and-evaluation.md) for datasets and loaders.*

`X` holds the features of 120 rides, in columns for the km and the minutes, and `y` their fares. Finish `make_loaders(X, y, n_train, n_valid, batch_size)`, which returns three `DataLoader`s, for the training, validation and test sets:

1. The training set is the first `n_train` rides, the validation set the next `n_valid`, and the test set all the rest.
2. The features of all three are standardized with the **mean and standard deviation of the training set**, taken with `std(correction=0)`, per column. The labels are left as they are.
3. Each loader is made from a `TensorDataset` of the features and labels of its set, with batches of `batch_size`. Only the training loader shuffles.

| Call                              | Returns                                                             |
| --------------------------------- | ------------------------------------------------------------------- |
| `make_loaders(X, y, 80, 20, 16)`  | loaders of 5, 2 and 2 batches, over 80, 20 and 20 rides             |

The validation and test sets must be standardized with numbers they didn't help to make, or the training set would leak into them. The checks look at the sizes, at the mean and spread of the training features, at the first validation rows and at the kind of each loader.
