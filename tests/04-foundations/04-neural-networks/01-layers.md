# Layers of neurons

## Drivers turn down short rides and long ones, and accept the ones in between. Why can't a logistic regression on the length of the ride follow that?

- [x] Its S only ever goes one way, and the counts go down and then up again
- [ ] Its probabilities can never go above 0.5
- [ ] It would need more than 700 orders
- [ ] The sigmoid can't give a probability close to 0

$\sigma(wx + b)$ can be steep or gentle, sit further to the left or to the right, and fall instead of rising, but it can't turn back. The best S for the counts only rises gently, from 0.18 to 0.48. That it stays below 0.5 comes from the U, not from the sigmoid, which can get as close to 0 or to 1 as its weight and bias make it. More orders would only give the same U more precisely.

## For a ride, the hidden neurons give $h_1 = 0.5$ and $h_2 = 0$, and the output neuron is $p = \sigma(4h_1 + 4h_2 - 1)$. What's $p$?

- [x] $\sigma(1)$, about 0.731
- [ ] $\sigma(3)$, about 0.953
- [ ] 1
- [ ] 0.5

The output neuron's line gives $z = 4 \times 0.5 + 4 \times 0 - 1 = 1$, and the sigmoid turns it into $p = \sigma(1) = 0.731$. $\sigma(3)$ gets the sign of the bias wrong, 1 is $z$ itself, without the sigmoid, and 0.5 is $h_1$, the activation of a hidden neuron, not the network's prediction.

## In the lesson's network, $b_1$ changes from 6 to 10, and nothing else does. What happens?

- [x] The first S moves from 3 to 5 km, so 4 km rides get a high probability too
- [ ] The first S moves from 3 to 1 km, so only the shortest rides get a high probability
- [ ] The first S gets steeper, but stays at 3 km
- [ ] Long rides get a higher probability

An S is halfway up where the line inside it is 0. For $h_1 = \sigma(-2x + 10)$, that's at $x = 5$, 2 km further to the right than before, so $h_1$ is close to 1 up to about 4 km now, and the network gives 4 km rides 0.628. How steep the S is depends on the weight, −2, which hasn't changed, and $b_1$ belongs to the first hidden neuron, which is about short rides.

## Take the sigmoids out of the hidden layer, so that $h_1 = w_1 x + b_1$ and $h_2 = w_2 x + b_2$, and keep the output neuron as it is. What shapes can the network draw?

- [x] Only an S, like a single logistic regression
- [ ] A U, as before
- [ ] Any shape, with enough hidden neurons
- [ ] Only a flat line, with the same probability for every ride

Put the two lines into the output neuron's line, and the result is still a line: $z = (v_1 w_1 + v_2 w_2)\,x + (v_1 b_1 + v_2 b_2 + c)$. So $p$ is the sigmoid of a line, an S, just as in logistic regression, and more hidden neurons would only add more lines to the sum. The line is flat only when the weights cancel out, like the lesson's, which give $z = -67$ for every ride.

## A network has 3 inputs, one hidden layer of 4 neurons, and 1 output neuron, and its layers are fully connected. How many parameters does it have?

- [x] 21
- [ ] 16
- [ ] 13
- [ ] 8

Each hidden neuron has a weight for each of the 3 inputs, and a bias, so the hidden layer has 4 × (3 + 1) = 16. The output neuron has a weight for each of the 4 hidden neurons, and a bias, which makes 5 more, 21 in all. 16 is only the hidden layer, 13 gives each hidden neuron a single weight, as if there were one input, and 8 counts the inputs and the neurons, not the parameters.

## A network has $h_1 = \text{ReLU}(-x + 3)$, $h_2 = \text{ReLU}(x - 11)$ and $p = \sigma(4h_1 + 4h_2 - 3)$. What does it give a 13 km ride?

- [x] $\sigma(5)$, about 0.993
- [ ] $\sigma(1)$, about 0.731
- [ ] $\sigma(-3)$, about 0.047
- [ ] $\sigma(-35)$, practically 0

At 13 km, $-x + 3 = -10$, which the ReLU turns into 0, and $x - 11 = 2$, which it keeps as it is. So $z = 4 \times 0 + 4 \times 2 - 3 = 5$. $\sigma(1)$ treats $h_2$ as if it stopped at 1, like a sigmoid, but a ReLU keeps growing. $\sigma(-3)$ turns both into 0, and $\sigma(-35)$ keeps the −10, which the ReLU turns into 0.
