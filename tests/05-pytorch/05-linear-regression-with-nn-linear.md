# Linear regression with nn.Linear

## What are the shape of the weight of `nn.Linear(4, 2)`, and the number of its parameters?

- [x] `[2, 4]`, and 10 parameters
- [ ] `[4, 2]`, and 8 parameters
- [ ] `[2, 4]`, and 8 parameters
- [ ] `[4, 2]`, and 10 parameters

The weight is `[out_features, in_features]`, so `[2, 4]`, with 8 numbers, and the 2 outputs have a bias each, which makes 10.

## What happens in a loop of training without `optimizer.zero_grad()`?

- [x] The slopes of every epoch add up, and the steps are too big
- [ ] Nothing: `step()` resets the slopes
- [ ] The optimizer stops taking steps
- [ ] The model forgets its weights

`backward()` adds to `.grad`, and the optimizer only reads it: `step()` doesn't reset anything. Each epoch's step then uses the sum of all the slopes so far.

## What does `criterion(y_pred, y)` give, for `criterion = nn.MSELoss()`?

- [x] The mean of the squared differences, a single number
- [ ] A tensor with the squared difference of every ride
- [ ] The sum of the absolute differences
- [ ] The slope of the loss for each weight

`MSELoss` squares the differences and takes their mean, and a loss has to be a single number to call `backward()` on. The slopes only exist after `backward()`, in the parameters' `.grad`.

## The model predicts new rides after training. Why is the prediction inside `torch.no_grad()`?

- [x] Nothing will go backwards through it, so there's no need to record it
- [ ] Without it, the weights would change
- [ ] `no_grad` makes the predictions more accurate
- [ ] A model can't predict outside it

Recording is only for `backward()`. A prediction doesn't need slopes, so `no_grad` saves time and memory. It doesn't change the numbers, and the weights don't change without a step.

## With the same data, the same starting weights and the same learning rate, how does `nn.Linear` with `SGD` compare with the by-hand training?

- [x] The losses and the weights come out the same
- [ ] It converges faster, because the optimizer is cleverer
- [ ] It ends with a smaller loss
- [ ] It can't be compared: they're different models

They're the same model and the same steps of gradient descent, written with a ready-made layer, loss and optimizer instead of by hand. That's why the lesson's two trainings print the same numbers.
