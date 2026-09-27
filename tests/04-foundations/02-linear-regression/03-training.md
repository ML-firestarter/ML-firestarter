# Training

## At the current $w$, the slope of the loss is −40. Which way does the next step move $w$?

- [x] Up: $w$ gets bigger
- [ ] Down: $w$ gets smaller
- [ ] Nowhere: $w$ stays where it is
- [ ] It depends on the bias

A negative slope means the loss goes down as $w$ goes up, so down the bowl is towards a bigger $w$. The step takes the slope away, and $w - \eta \times (-40)$ is bigger than $w$.

## At $w = 5$, the slope for $w$ is 20, and the learning rate is 0.05. What's $w$ after one step?

- [x] 4
- [ ] 6
- [ ] 4.95
- [ ] −15

The step is the learning rate times the slope, 0.05 × 20 = 1, and it's taken away: 5 − 1 = 4. 6 adds the step, which goes uphill, 4.95 takes away only the learning rate, and −15 leaves the learning rate out.

## Over four steps, the loss goes 50, 80, 150, 310. What should you do?

- [x] Lower the learning rate
- [ ] Raise the learning rate
- [ ] Train for more steps
- [ ] Start from a different $w$

A loss that grows with every step means that each step overshoots the bottom by more than the last: the training has diverged, because the learning rate is too big. More steps would only make it worse.

## The learning rate stays the same all the time. Why do the steps get shorter near the bottom of the bowl?

- [x] The bowl is flatter there, so the slope is smaller
- [ ] The learning rate gets smaller as training goes on
- [ ] The loss is smaller, and each step is the learning rate times the loss
- [ ] Each step is half as long as the one before

Each step is the learning rate times the slope, and the slope shrinks as the bowl flattens out towards the bottom. The learning rate doesn't change, and the step depends on the slope, not on the loss itself.

## Linear regression can be solved exactly, without any steps. So why learn gradient descent on it?

- [x] Most models, such as neural networks, have no exact solution, and gradient descent trains them all
- [ ] Gradient descent finds a better line than the exact solution
- [ ] The exact solution only works for two receipts
- [ ] Gradient descent needs no learning rate

For linear regression, both find the same line. But almost no other model has an exact solution, and gradient descent works for all of them, so it's worth learning on the simplest model first.

## The loss is 30 at $w = 2$ and 24 at $w = 2.1$. About what's the slope there?

- [x] About −60
- [ ] About −6
- [ ] About 60
- [ ] About −0.6

The loss dropped by 6 while $w$ grew by 0.1, so it drops about 6 ÷ 0.1 = 60 for each 1 added to $w$. It's a drop, so the slope is negative: about −60. −6 is the change in the loss before it's divided by the change in $w$, and 60 has the wrong sign.
