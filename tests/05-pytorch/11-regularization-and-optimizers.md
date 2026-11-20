# Regularization and optimizers

## SGD with `momentum=0.9` meets the same slope at every step. Next to plain SGD with the same learning rate, how big do its steps get?

- [x] About ten times as big
- [ ] The same size
- [ ] 0.9 times as big
- [ ] Twice as big

The velocity is 0.9 times what it was plus the new slope, so it grows towards the slope divided by $1 - 0.9$: ten slopes. Steps in the same direction add up. When the slopes change sign from step to step, they cancel out in the velocity instead.

## Two parameters have slopes of 100 and 0.01 at every step. After a few steps of Adam, with one learning rate for both:

- [x] Both have moved about the same distance
- [ ] The first has moved ten thousand times as far as the second
- [ ] The second has moved further, because small slopes are stepped up
- [ ] Neither has moved, because the slopes cancel out

Adam divides each parameter's average slope by the usual size of that parameter's slopes, which gives about 1 for any steady slope. So each step moves each parameter by about the learning rate. It's plain SGD that moves the first one ten thousand times as far.

## A training loop lowers the learning rate once an epoch with a scheduler. Where does `scheduler.step()` go?

- [x] After the loop over the batches, once in every epoch
- [ ] Before `loss.backward()`, for every batch
- [ ] In place of `optimizer.step()`
- [ ] Before the first epoch, and nowhere else

The optimizer takes a step for every batch, and the scheduler then sets the learning rate for the next epoch. A scheduler changes the optimizer's learning rate, and takes no steps of its own, so it can't replace `optimizer.step()`.

## What does `weight_decay=0.1` do at each step of an optimizer?

- [x] It also pulls every weight towards 0, the more the bigger the weight is
- [ ] It lowers the learning rate by 10%
- [ ] It sets a tenth of the weights to 0
- [ ] It stops the training once the loss has stopped falling

Weight decay takes a small share of each weight away at every step, on top of the step against the slope. Weights that the data needs are held up by the slopes of the loss, and the others fade, so the weights stay small. Setting numbers to 0 at random is what dropout does, and a scheduler is what lowers the learning rate.

## In training mode, an `nn.Dropout(0.5)` layer gets a tensor of ones. What comes out?

- [x] Zeros and twos: each number is set to 0 with a probability of a half, and the rest are doubled
- [ ] Zeros and ones: each number is set to 0 with a probability of a half
- [ ] Every number is 0.5
- [ ] The ones, unchanged

The numbers that are kept are multiplied by $1 / (1 - p)$, which is 2 for $p = 0.5$, so that what goes on to the next layer adds up to about as much as without dropout. The ones come out unchanged only in evaluation mode.

## A model has an `nn.Dropout(0.5)` layer. What does that layer do after `model.eval()`?

- [x] Nothing: it passes its input on unchanged
- [ ] It sets half of the numbers to 0, as in training
- [ ] It multiplies every number by 0.5
- [ ] It sets the same numbers to 0 at every call

Dropout is for training. In evaluation mode nothing is dropped and nothing is scaled, so the network answers with all of its hidden numbers, and gives the same answer every time. That's why predictions come after `model.eval()`.

## During training, the loss on the training pictures falls to 0.001, while the loss on the validation pictures rises from 0.39 to 0.55. What's happening?

- [x] The network is learning its training pictures by heart, and getting worse on pictures it hasn't seen
- [ ] The learning rate is too small
- [ ] The network is too small to learn the pictures
- [ ] The network is being trained on the validation pictures

That's overfitting: a training loss near 0 says that the network has room to memorize, and a rising validation loss says that what it memorizes doesn't carry over to new pictures. A learning rate that's too small or a network that's too small would leave the training loss high. Weight decay, dropout, stopping early and more data all help.
