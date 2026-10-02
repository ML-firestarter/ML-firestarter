# Classifying images

## A network for 5 classes gets a batch of 32 pictures. What shape do its logits have?

- [x] `[32, 5]`
- [ ] `[5, 32]`
- [ ] `[32]`
- [ ] `[32, 1]`

The last layer has one output for each class, so each picture gets 5 scores, and a batch of 32 pictures gives 32 rows of them. `argmax(dim=1)` then picks the best of the 5 in every row.

## Which loss goes with a classifier whose last layer gives one logit per class?

- [x] `nn.CrossEntropyLoss()`, which takes the logits and the class numbers
- [ ] `nn.MSELoss()`, which takes the probabilities
- [ ] `nn.CrossEntropyLoss()`, after a softmax on the logits
- [ ] `nn.MSELoss()`, which takes the class numbers

`CrossEntropyLoss` applies the softmax itself, so it takes the logits as they are, and the labels as class numbers. A softmax before it would be applied twice, and the mean squared error isn't made for choosing among classes.

## What happens with `nn.CrossEntropyLoss()(logits, torch.tensor([1.0, 0.0]))`?

- [x] An error: the class numbers have to be of the type `long`, not floats
- [ ] It works, and the labels are treated as probabilities
- [ ] It works, and gives the accuracy
- [ ] An error: it takes only one picture at a time

Class numbers are whole numbers, `torch.tensor([1, 0])`, and the loss says that it expected a target of the type Long or Byte. `1.0` and `0.0` are floats.

## The loss of the first epoch of a 10-class network is 2.27. What does it say?

- [x] The network knows next to nothing yet: 10 equal guesses cost about 2.30
- [ ] The network is already right about 2 pictures of 10
- [ ] The training has diverged
- [ ] The loss is in the wrong units

A network that gives all 10 digits the same probability, 0.1, has a loss of $-\ln 0.1 = 2.30$ for every picture, and a network that's only starting is close to that. The loss falls as the network learns.

## What does `logits.argmax(dim=1)` give for a batch of logits `[32, 10]`?

- [x] The class with the biggest logit for each of the 32 pictures
- [ ] The biggest logit of the whole batch
- [ ] The probability of each class
- [ ] The 10 classes in order of size

`dim=1` is the dimension of the classes, so for every row of 10 logits, `argmax` gives the number, 0 to 9, of the biggest one: a tensor of 32 class numbers, the network's answers.
