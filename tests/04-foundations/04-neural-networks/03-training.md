# Training a network

## In a mini-batch of 4 orders, the orders' slopes for $c$ are 0.3, −0.5, 0.1 and −0.3, and $c$ is 1. With a learning rate of 0.5, what's $c$ after the step?

- [x] 1.05
- [ ] 1.2
- [ ] 0.95
- [ ] 1.1

The mini-batch's slope is the average of the orders' slopes: (0.3 − 0.5 + 0.1 − 0.3) ÷ 4 = −0.1. The step moves $c$ against it: $1 - 0.5 \times (-0.1) = 1.05$. 1.2 uses the sum of the slopes, −0.4, instead of their average, 0.95 moves $c$ with the slope instead of against it, and 1.1 leaves out the learning rate.

## Both hidden neurons start with the same weight and the same bias, and the same weight to the output neuron. What happens in training?

- [x] They get the same slopes at every step, so they stay the same, and the network can't draw a U
- [ ] They drift apart after a few steps, as the orders are different
- [ ] Training stops after the first step
- [ ] Only the output neuron's parameters change

Neurons that start the same give the same activation for every order, and get the same errors, so they get the same slopes and take the same steps, forever: they stay twins, whatever the orders. A U needs one S that falls and another that rises. Starting every weight and bias as a different random number avoids this.

## Why does the lesson give the network each ride's distance from 7 km, km − 7, instead of its length in km?

- [x] The middle of a random S then lands among the orders, so far fewer starts get stuck
- [ ] km − 7 makes a different network, with more parameters
- [ ] The sigmoid can't take numbers above 7
- [ ] It makes the loss 0 from the start

With $w$ and $b$ random between −1 and 1, the middle of an S, where $wx + b = 0$, lands between −1 and 1 half the time. With km as the input, that's at the far left of the orders, which go from 1 to 14 km, and with km − 7, it's between 6 and 8 km, right among them. On the eight orders, that took the stuck starts from 11 of 20 to none. It's still the same network, as an S on km is an S on km − 7 too, with a different bias.

## Training gets stuck at a loss of 0.49, with every slope close to 0, while other starts get close to 0. Which of these can help?

- [x] Starting again from another seed
- [x] Centring the inputs on 0, if they aren't already
- [ ] Taking many more steps from the same start
- [ ] Starting every parameter at 0

The network is in a flat spot: every slope is close to 0, so gradient descent hardly moves, even though the loss could go much lower. After 50,000 steps, seed 1 from the lesson was still at 0.478. Where training ends up depends on where it starts, so another random start can do much better, and centred inputs make the bad starts rarer. Starting every parameter at 0 is worse still: the hidden neurons stay twins, and on the eight orders, training doesn't move at all.

## A training set has 1,000 examples, and each mini-batch has 50 of them. How many steps does one epoch take?

- [x] 20
- [ ] 50
- [ ] 1,000
- [ ] 50,000

An epoch uses every example once, and each step uses one mini-batch, so it takes 1,000 ÷ 50 = 20 steps. 50 is the size of a mini-batch, 1,000 would be one step for each example, and 50,000 multiplies instead of dividing.

## In training, the loss on the training set keeps falling, but the loss on the validation set has been rising since step 400. Which network should you keep?

- [x] The one from step 400, where the validation loss was lowest
- [ ] The one from the last step, where the training loss is lowest
- [ ] One trained for more steps, until the training loss reaches 0
- [ ] The one from step 0, before it learned anything

The network never trains on the validation orders, so their loss shows how it does on orders it hasn't seen. From step 400 on, it has been learning the training orders themselves, chance outcomes and all: it overfits. Keeping the network with the lowest validation loss, and stopping once it doesn't improve, is early stopping. The training loss keeps falling, so it can't tell when to stop, and at step 0, the network is still random.
