# Saving, loading and tuning

## Why does a checkpoint hold the hyperparameters as well as the state dict?

- [x] The weights don't say how the layers fit together, and a model of the same structure has to be built to load them
- [ ] The state dict doesn't hold the weights
- [ ] `torch.save` can't save tensors alone
- [ ] The hyperparameters make the file load faster

A state dict is only a dictionary of tensors by layer name. To load it, `load_state_dict` needs a model with the same layers and shapes, and the hyperparameters, like the layer sizes, are what builds it.

## `make_model(64, 40, 10).load_state_dict(saved)`, where `saved` is from `make_model(64, 50, 10)`. What happens?

- [x] An error that lists the weights whose shapes don't match
- [ ] The 40 hidden numbers get the first 40 of the 50
- [ ] It works, and the model starts from random weights
- [ ] The saved weights are resized

`load_state_dict` is strict about names and shapes: a weight of `[10, 50]` can't go where `[10, 40]` is expected. It stops with a message about every mismatch, and changes nothing.

## What does `weights_only=True` do in `torch.load`?

- [x] It accepts only tensors and plain Python data, so a file can't run code
- [ ] It loads the weights and leaves out the biases
- [ ] It loads the file faster
- [ ] It turns the model into evaluation mode

A checkpoint file can hold objects whose loading runs code, and loading a file from someone else could then run theirs. `weights_only=True` refuses everything but tensors and simple data, which is all a checkpoint of weights needs.

## Why is a learning rate drawn as `10 ** (u * 1.5 - 2)`, with `u` between 0 and 1?

- [x] So that the exponent is even, and each size of learning rate gets about as many tries
- [ ] So that it's always a whole number
- [ ] So that it's always bigger than 1
- [ ] Because PyTorch can't draw a number below 1

Learning rates matter in multiples: 0.01 and 0.03 differ as much as 0.1 and 0.3. Drawing the exponent evenly gives each such step about the same number of tries, where an even draw between 0.01 and 0.3 would put most of them above 0.03.

## Why is the best trial chosen on the validation set, and the test set kept for the end?

- [x] The test set measures the chosen model once, without having helped to choose it
- [ ] The test set is too small to choose with
- [ ] The validation set is the one that trains the model
- [ ] The test set can only be used before training

If the test score picked the winner, the winner's test score would be partly luck: the best of many tries looks good on any set that picked it. A set that took no part in the choice gives an honest estimate for new data.
