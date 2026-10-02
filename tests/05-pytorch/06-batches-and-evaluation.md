# Batches and evaluation

## 1,000 rides go through a `DataLoader` with `batch_size=32`. How many batches does one epoch have?

- [x] 32: thirty-one of 32 rides and a last one with 8
- [ ] 31: the last, smaller batch is dropped
- [ ] 1,000: one for every ride
- [ ] 32, all of them with 32 rides

The loader keeps the rides that are left over as a smaller last batch: 31 × 32 = 992, and 8 more. It would drop it only with `drop_last=True`.

## What does `shuffle=True` do?

- [x] It gives the rides in a new random order every epoch
- [ ] It mixes the features of each ride
- [ ] It shuffles the dataset once, when the loader is made
- [ ] It makes every batch hold rides of different lengths

The order of the rides changes with every pass over the loader, so the batches differ between epochs. The rides themselves and their features are untouched, and a seed makes the order repeatable.

## Why is the validation set kept apart from the training set?

- [x] A model measured on the rides it learned from looks better than it really is
- [ ] The training set is too small to measure
- [ ] The validation rides are used to take the steps
- [ ] It makes the training faster

The model has seen the training rides, so it may have learned them by heart, and its score on them says little about new rides. The validation rides are used to measure, and to choose between models.

## The last of 7 validation batches has 8 rides, and the others 32. Why isn't the mean of the batches' RMSEs the RMSE of all the rides?

- [x] The small batch counts as much as a full one in the mean, but has fewer rides
- [ ] RMSE can't be worked out for a batch
- [ ] The mean of square roots is always bigger
- [ ] The batches overlap

Each batch's RMSE is the same weight in a mean of means, whatever its size. Adding up the squared errors of all the rides, dividing by their number and taking the root counts every ride once.

## What does `model.eval()` together with `torch.no_grad()` do in an evaluation?

- [x] The model is in evaluation mode, and nothing is recorded for `backward()`
- [ ] The model stops predicting and only measures
- [ ] The weights are saved, and restored afterwards
- [ ] The slopes are reset to 0

`eval()` switches layers that behave differently in use than in training, and `no_grad()` skips the record that only `backward()` needs, which saves time and memory. Neither changes the weights.
