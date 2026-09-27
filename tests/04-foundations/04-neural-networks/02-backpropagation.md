# Backpropagation

## An order was turned down, and the network gives it $p = 0.2$, with $h_1 = 0.5$. What's the slope of its penalty for $v_1$?

- [x] −0.4
- [ ] 0.4
- [ ] −0.8
- [ ] −0.1

The output neuron's error is $\delta = p - y = 0.2 - 1 = -0.8$, and $v_1$ multiplies $h_1$, so its slope is $\delta h_1 = -0.8 \times 0.5 = -0.4$. 0.4 works the error out the other way round, as $y - p$, and −0.8 leaves out $h_1$: that's the slope for $c$. −0.1 also multiplies by the slope of the sigmoid, $h_1(1 - h_1) = 0.25$, which belongs in the errors of the hidden neurons, not in the slopes of the output neuron.

## For an order, $p - y = -0.5$, $h_1 = 0.9$ and $v_1 = 2$. What's the error of the first hidden neuron, $\delta_1$?

- [x] −0.09
- [ ] −1
- [ ] −0.9
- [ ] −0.1

$\delta_1 = \delta\,v_1\,h_1(1 - h_1) = -0.5 \times 2 \times 0.9 \times 0.1 = -0.09$. −1 leaves out the slope of the sigmoid, $h_1(1 - h_1)$, −0.9 multiplies by $h_1$ instead of by $h_1(1 - h_1)$, and −0.1 multiplies by $1 - h_1$ alone.

## For an order, the first hidden neuron gives $h_1 = 0.9999$. What does that mean for the order's slopes for $w_1$ and $b_1$?

- [x] They're close to 0, as the neuron's S is almost flat there
- [ ] They're big, as the neuron is almost sure
- [ ] They're the same as for an order with $h_1 = 0.5$
- [ ] They depend only on the label, not on $h_1$

Both slopes have $\delta_1$ in them, and $\delta_1$ has the slope of the sigmoid in it, $h_1(1 - h_1)$, which is 0.9999 × 0.0001, about 0.0001. Far out on the flat top of the S, a small change to $w_1$ or $b_1$ hardly changes $h_1$, so it hardly changes the penalty either. At $h_1 = 0.5$, the S is at its steepest, and the slope of the sigmoid is 0.25.

## For one parameter, backpropagation gives a slope of 0.52, and a nudge both ways gives −0.52. What does that mean?

- [x] There's a mistake somewhere, in the backpropagation or in the nudge
- [ ] Both are right, as a nudge only gives the size of a slope, not its sign
- [ ] The nudge was too big
- [ ] The parameter is at its best value

A nudge both ways and backpropagation should give almost the same slope, like −2.19317 and −2.19318 for $w_1$ in the lesson. A nudge gives the sign too: if the penalty grows when the parameter does, the slope is positive. A nudge that's too big would make them differ a little, not flip the sign, and at the best value, both would give about 0. So one of them has a mistake, like an error worked out as $y - p$ instead of $p - y$, which flips every sign.

## A network has 1,000 parameters. How many forward passes does it take to get the slopes for all of them, for one example, with a nudge both ways?

- [x] 2,000
- [ ] 1,000
- [ ] 2
- [ ] 1,000,000

A nudge both ways takes two forward passes for each parameter: one with it a little bigger, and one with it a little smaller. Backpropagation gets all 1,000 slopes from one forward pass and one backward pass, which is why training uses it, and nudges only check it.

## Why do the hidden layers of deep networks usually use the ReLU, not the sigmoid?

- [x] Its slope is 1 for any positive $z$, so errors pass back through it without shrinking
- [ ] It gives a number between 0 and 1, like a probability
- [ ] Its slope is 0.25 at most, which keeps the steps small
- [ ] It makes the backward pass unnecessary

In a deep network, an error passes back through many layers on its way from the output, and each activation function on the way multiplies it by its slope. The sigmoid's slope is 0.25 at most, so with many sigmoid layers, the errors of the first layers shrink to almost nothing: the vanishing gradient problem. The ReLU's slope is 1 wherever $z$ is positive. It's the sigmoid that gives a number between 0 and 1, which is why the output neuron keeps it, and the backward pass is needed whatever the activation function.
