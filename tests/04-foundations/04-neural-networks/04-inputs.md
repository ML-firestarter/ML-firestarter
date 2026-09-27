# Preparing the inputs

## Logistic regression on km alone can only draw an S. With km² as a second input, it draws a U. How?

- [x] $z$ falls and then rises again, as the weight for km is negative, the one for km² positive, and km² grows faster than km
- [ ] km² turns logistic regression into a network with a hidden layer
- [ ] The sigmoid bends the other way for inputs bigger than 100
- [ ] km² tells it something about the orders that km doesn't

Training finds $w_1 = -1.51$ and $w_2 = 0.103$. For short rides, the weight for km pulls $z$ down, but km² grows much faster than km, so for long ones, the weight for km² pushes it back up: $z$ bottoms out at about 7.3 km, and the sigmoid turns that into a U. It's still logistic regression, with no hidden layer, and the same sigmoid. km² tells it nothing new about the orders, as it's worked out from km: it only lets $z$ bend.

## The network from the first lesson draws a U from km alone, without km². How?

- [x] Its hidden neurons work out inputs for the output neuron, with weights that training finds
- [ ] Each of its neurons multiplies its input by itself, so it works out km² on its own
- [ ] Its output neuron has no sigmoid, so it isn't limited to an S
- [ ] It can't: it only draws a U with km² as an input too

Each hidden neuron is a small logistic regression on km: $h_1$ is for the short rides, and $h_2$ for the long ones. They're the inputs of the output neuron, which puts them together into a U. Nobody had to see the U and choose them, as training found their weights, just like the output neuron's. No neuron multiplies an input by itself: each multiplies its inputs by weights, adds a bias, and puts the result through the sigmoid, the output neuron too.

## Training logistic regression on km and km², as they are, takes over 100,000 steps. Why?

- [x] km² is much bigger than km and 1, so a learning rate that suits $w_2$ is far too small for $w_1$ and $b$
- [ ] Its loss has flat spots, like a network's, where every slope is close to 0
- [ ] Every step uses all 700 orders, instead of a mini-batch
- [ ] Gradient descent changes only one of the three weights at each step

A step changes $z$ through each weight by the weight's change times its input, and for a 14 km ride, $w_2$ multiplies 196, $w_1$ 14, and $b$ just 1. With a learning rate big enough to move $w_1$ and $b$ along, $w_2$ overshoots, so the learning rate has to suit $w_2$, and then $w_1$ and $b$ crawl. Logistic regression has no flat spots like a network's, as the only place where all its slopes are 0 is the bottom. Every step changes all three weights, and mini-batches would make each step quicker, but wouldn't make the steps fewer.

## The training rides have an average length of 8 km, and a spread of 4 km. Standardized, what does a 14 km ride go in as?

- [x] 1.5
- [ ] 6
- [ ] 3.5
- [ ] 1.25

Standardizing takes away the average, and divides by the spread: (14 − 8) ÷ 4 = 1.5. 6 only takes away the average, 3.5 only divides by the spread, and 1.25, (14 − 4) ÷ 8, swaps the average and the spread.

## What does standardizing an input do?

- [x] Over the training orders, it gives the input an average of 0 and a spread of 1
- [ ] It puts every value of the input between 0 and 1
- [ ] It gives the input an average of 1 and a spread of 0
- [ ] It changes the model, so that it draws a different U

Taking away the average centres the input on 0, and dividing by the spread scales it so that its spread is 1: the rides from 2 to 14 km go in as −1.5 to 1.5. Putting every value between 0 and 1 is min-max scaling, and standardized values can be negative, or above 1, like the 1.77 of a 14 km ride's km². A spread of 0 would mean that every value is the same. And the model draws the same U: standardizing only takes away a number and divides by another, so the weights change to make up for it, and the predictions don't.

## A model was trained on standardized inputs. Which average and spread should standardize a new order's inputs?

- [x] The training orders', the same as in training
- [ ] Their own, worked out from the new orders of that day
- [ ] None, as new orders go in as they are
- [ ] An average of 0 and a spread of 1

The weights only work on inputs standardized the way they were in training, so the averages and spreads are part of the model, and are kept with its weights. With the new orders' own average and spread, the same ride would go in as a different number, depending on which other orders came in with it, and a single order would have a spread of 0, with nothing to divide by. Put in as they are, the inputs would be far too big: a 5 km ride gets $z = 137.5$, and the model is sure that it'll be turned down. An average of 0 and a spread of 1 are what the inputs have after standardizing, not what they're standardized with.
