# Fooling a network

## What is an adversarial example?

- [ ] A picture that a network reads wrong because it was hard to read in the first place
- [x] A picture changed a little, on purpose, so that a network reads it wrong while a person reads the same as before
- [ ] A training picture that was given the wrong label
- [ ] A picture with random noise added to it

The change is made on purpose, in the direction that hurts the network, and it's small enough that the picture means the same to a person. A picture that's just hard to read, or one with random noise on it, isn't one: nobody aimed it at the network.

## `slope` holds the slope of the loss for every pixel of the pictures in `X`. Which line is FGSM's step?

- [x] `(X + epsilon * slope.sign()).clamp(0, 1)`
- [ ] `(X - epsilon * slope.sign()).clamp(0, 1)`
- [ ] `(X + epsilon * slope).clamp(0, 1)`
- [ ] `(X + slope.sign()).clamp(0, epsilon)`

Every pixel moves by ε in the direction of the sign of its slope, up the loss, and the clamp keeps the pixels between 0 and 1. With a minus, the step goes down the loss, and the network gets more sure of the right answer. Without `sign()`, a pixel moves by ε times its slope, which is far less than ε for most pixels.

## A pixel is at 0.02 and its slope is negative. Where is it after FGSM with ε = 0.1?

- [ ] At −0.08
- [ ] At 0.12
- [x] At 0
- [ ] At 0.02

The step takes it down to −0.08, which is no pixel, and `clamp(0, 1)` brings it back to 0. It moved by 0.02, less than ε, so the picture is still inside the ε-ball.

## Three pixels of a picture are 0.5, 0.2 and 0.9. After an attack, they're 0.58, 0.2 and 0.85, and no other pixel has changed. What's the L∞ distance between the two pictures?

- [ ] 0.13
- [x] 0.08
- [ ] 0.05
- [ ] 0.03

The L∞ distance is the biggest change of any pixel. The three changes are 0.08, 0 and 0.05, so it's 0.08, and the attacked picture is in the ε-ball for any ε of 0.08 or more. 0.13 is the changes added up, which is another way of measuring.

## FGSM with ε = 0.1 takes a network's accuracy from 94% to 56%. Changing every pixel by 0.1 up or down at random leaves it at 92%. Why the difference?

- [ ] FGSM changes more pixels than the random changes do
- [ ] FGSM changes each pixel by more than the random changes do
- [x] FGSM moves every pixel in the direction that raises the loss, and random directions mostly cancel out
- [ ] The random changes are undone by `clamp(0, 1)`

Both move every pixel by the same 0.1. With random signs, about half of the pixels push the loss up and half push it down. FGSM takes each sign from the slope, so all the pixels push the same way.

## `fgsm` gets a batch of 297 pictures, and takes the slopes of the mean loss of the batch. What does each picture get?

- [ ] The same step as every other picture, from the average of the 297 slopes
- [ ] A step that's 297 times smaller than the one it would get alone
- [x] A step along its own slopes, the same one it would get alone
- [ ] Nothing, because slopes can only be taken for one picture at a time

A picture's pixels change only that picture's part of the loss, so its slopes are its own. The mean divides them by 297, and `sign()` gives the same signs for a slope and for a 297th of it.

## An attack leaves a network that tells ten digits apart with an accuracy of 4%. What does that say?

- [ ] The network is guessing
- [x] The attack leads the network to wrong answers: guessing would be right about 10% of the time
- [ ] The attack changed the labels
- [ ] The network wasn't trained for long enough

A network that guessed among ten digits would get about one picture in ten. Fewer than that means the network is being pushed away from the right answer, each time, by an attack that knows which way to push.

## Why does the attack call `requires_grad_()` on a copy of the pictures?

- [ ] So that the optimizer can change the pictures
- [ ] So that the model's weights are frozen
- [x] So that autograd works out the slope of the loss for every pixel
- [ ] So that the pixels can be clamped

Autograd only records what's done with marked tensors. Pictures are data, and come unmarked, so the attack marks them, on a copy, and then asks for the slope with `torch.autograd.grad(loss, X)`. No optimizer is involved: the attack takes its step by hand.
