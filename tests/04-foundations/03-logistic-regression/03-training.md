# Training

## An order with a 10-minute wait wasn't cancelled, and the rule gives it $p = 0.9$. What does it add to the sum in the slope for $w$, before the sum is divided by the number of orders?

- [x] 9
- [ ] −9
- [ ] 0.9
- [ ] 18

Each order adds its error, $p - y = 0.9 - 0 = 0.9$, times its wait: 0.9 × 10 = 9. −9 subtracts the other way round, 0.9 leaves out the wait, which only the slope for $b$ does, and 18 doubles it, like the slope of the MSE.

## At the current rule, the slope for $w$ is 0.5, and the slope for $b$ is −0.2. With a learning rate of 0.1, what does one step do?

- [x] $w$ goes down by 0.05, and $b$ goes up by 0.02
- [ ] $w$ goes up by 0.05, and $b$ goes down by 0.02
- [ ] Both go down by 0.07
- [ ] $w$ goes down by 0.5, and $b$ goes up by 0.2

Each parameter moves against its own slope, by the learning rate times the slope: $w - 0.1 \times 0.5$ is 0.05 less than $w$, and $b - 0.1 \times (-0.2)$ is 0.02 more than $b$. The second choice goes uphill, and the last one leaves out the learning rate.

## At $w = 0$ and $b = 0$, the slope for $b$ on the six orders is 0. Why?

- [x] Every order gets 0.5, and half of them were cancelled, so their errors, 0.5 and −0.5, cancel out
- [ ] The slope for $b$ is always 0
- [ ] $b$ is already at its best value
- [ ] The slope for $b$ doesn't depend on the labels

The slope for $b$ averages the errors, $p - y$. With every $p$ at 0.5, the three orders that weren't cancelled have an error of 0.5, and the three that were have −0.5, so they add up to 0. That's only so at the start: once the first step has changed $w$, the probabilities change, and $b$ starts to move too, towards its best value, −2.93.

## Training on the six orders can't get the log loss below 0.479. Why?

- [x] Two of the customers did the opposite of what their waits suggest, so no rule can be sure and right about every order
- [ ] The learning rate is too small to get any lower
- [ ] Gradient descent can never get a log loss below about 0.5
- [ ] The sigmoid can't give a probability above 0.9

A loss close to 0 needs a rule that gives what happened a probability close to 1 for every order. But the customer with a 6-minute wait cancelled, and the one with a 10-minute wait didn't, so no rule can be sure and right about all six. 0.479 is the lowest loss any rule can get on them, and a smaller learning rate would only get there more slowly.

## Over five steps, the loss goes 0.60, 0.95, 0.58, 1.10, 0.57. What should you do?

- [x] Lower the learning rate
- [ ] Raise the learning rate
- [ ] Train for more steps
- [ ] Start from a different $w$

A loss that jumps up and down means that the steps overshoot the bottom, and the next ones jump back. A smaller learning rate takes shorter steps, and the loss drops smoothly. With the log loss, too big a learning rate makes the training bounce around like this, and it never settles, however many steps it takes.

## Linear regression can be solved directly, with the normal equation. Why is logistic regression trained step by step?

- [x] There's no formula for the $w$ and $b$ that make its slopes 0
- [ ] Solving it directly would find a worse rule
- [ ] Gradient descent finds a better rule than any formula
- [ ] Logistic regression has more parameters than linear regression

The best rule is where both slopes are 0, but every $p_i$ in them is the sigmoid of something with $w$ and $b$ in it, and no formula can solve those equations for $w$ and $b$. Gradient descent doesn't need a formula for the answer, only one for the slopes, which is why it can train logistic regression, neural networks and language models alike.
