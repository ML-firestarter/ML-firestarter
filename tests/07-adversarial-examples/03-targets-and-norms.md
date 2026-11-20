# Targets and norms

## An attacker wants a picture of a 1 to be read as a 7. What does a step of the targeted attack do?

- [ ] It raises the loss for the label 1, like an untargeted attack
- [x] It lowers the loss for the label 7, by stepping against the signs of the slopes
- [ ] It raises the loss for the label 7, by stepping along the signs of the slopes
- [ ] It swaps the weights of the outputs for 1 and for 7

A targeted attack works out the loss for the label it wants, and goes down it: the more the network believes in a 7, the lower that loss. Raising the loss for the 1 would make the network wrong, and it could read any other digit.

## With the same ε, an untargeted PGD fools a network on 90% of the pictures. What can be said of a targeted PGD that wants all of them read as a 6?

- [ ] It also succeeds on about 90% of them
- [ ] It succeeds on more of them, because it has a clear goal
- [x] It succeeds on fewer of them: reaching one chosen class is harder than reaching any wrong class
- [ ] It can't succeed on any picture that isn't a 6 already

The untargeted attack is done as soon as the picture crosses into any other class, the nearest one. The targeted attack has to reach one class in particular, which may be a long way off. On the digits, with ε = 0.15, the untargeted attack fooled 90% of the pictures, and the attack aimed at a 6 got 18% of them read as a 6.

## A perturbation changes four pixels by 0.3, −0.4, 0 and 0. What's its L∞ norm?

- [ ] 0.3
- [x] 0.4
- [ ] 0.5
- [ ] 0.7

The L∞ norm is the biggest change, with its sign dropped: 0.4. 0.5 is its L2 norm, and 0.7 is the changes added up without their signs.

## And what's the L2 norm of that perturbation, with its changes of 0.3, −0.4, 0 and 0?

- [ ] 0.4
- [ ] 0.7
- [x] 0.5
- [ ] 0.25

The L2 norm is the square root of the sum of the squares: 0.09 + 0.16 = 0.25, and the root of 0.25 is 0.5. That's the length of the perturbation.

## `delta` holds the perturbations of a batch of pictures, with the shape `[pictures, 1, 8, 8]`. Which line gives the L2 norm of each picture's perturbation?

- [ ] `delta.norm()`
- [x] `delta.flatten(1).norm(dim=1)`
- [ ] `delta.abs().max()`
- [ ] `delta.flatten(1).abs().max(dim=1).values`

`flatten(1)` makes a row of 64 numbers for each picture, and `norm(dim=1)` takes the norm of each row. `delta.norm()` gives a single number for the whole batch. The last line gives each picture's L∞ norm.

## PGD in the L2 ball differs from PGD in the L∞ ball in its step. How?

- [ ] It moves every pixel by α, in the direction of the sign of its slope
- [ ] It moves only the pixel with the biggest slope
- [x] It moves the pixels along the slopes themselves, scaled so that the whole step has the length α
- [ ] It takes one step of the whole ε

With a limit on the length of the perturbation, the loss rises the most in the direction of the slopes, so pixels with big slopes move the most and the others hardly move. Moving every pixel by α along the sign of its slope is the step for the L∞ ball, where each pixel has a limit of its own.

## Two networks read pictures of 64 pixels. One keeps 60% under "L∞, ε = 0.1", and the other 60% under "L2, ε = 0.1". Which of them withstood the stronger attack?

- [x] The first one: in the L∞ ball every pixel may move by 0.1, which allows perturbations up to 0.8 long
- [ ] The second one: the L2 ball is the bigger of the two
- [ ] Neither: the ε is the same, so the attacks are equally strong
- [ ] It can't be said without knowing the number of steps

The L2 ball of 0.1 holds only perturbations with a length of 0.1 or less. The L∞ ball of 0.1 lets all 64 pixels move by 0.1 at once, a perturbation of length $0.1 \times \sqrt{64} = 0.8$. An ε means nothing without its norm.

## An attack pushes a picture's embedding away from where it was, by climbing the squared distance between the two embeddings. It starts at the picture itself, and returns it unchanged. Why?

- [ ] An embedding has no slopes for the pixels
- [ ] The projection brings the picture back to where it started after every step
- [x] At the picture itself the distance is 0, its lowest, so every slope is 0 and no pixel moves
- [ ] The attack needs the labels to know where to go

A distance can't be lower than 0, and at a lowest point all the slopes are 0. The sign of 0 is 0, so the step moves nothing, and the next step starts from the same place. A random start inside the ball puts the picture where the slopes point somewhere.

## What does an attack on a network's embedding need that an attack on its classes doesn't?

- [ ] The labels of the pictures
- [ ] A bigger ε
- [x] Nothing more: it needs no labels, only the picture and the network
- [ ] A network that was trained with adversarial training

The loss is the distance between two embeddings of the same picture, before and after the change, so there's nothing to label. That's why this attack works on networks that are used for their embeddings alone, for comparing pictures or searching through them.
