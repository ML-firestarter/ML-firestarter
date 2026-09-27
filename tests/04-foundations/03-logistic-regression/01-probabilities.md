# Predicting a probability

## Why can't a straight line predict the probability of a cancellation?

- [x] Far enough out, any line that isn't flat goes below 0 or above 1
- [ ] A straight line can't get close to the counts in the middle
- [ ] A straight line can only predict whole numbers
- [ ] A straight line needs more than one feature

A line keeps on climbing, so at some wait, it predicts a probability above 1, and at another, one below 0. The line through the counts at 6 and 10 minutes was close to them in the middle, but it predicted −0.19 at 2 minutes and 1.19 at 14 minutes.

## A rule has $w = 1$ and $b = -8$. The sigmoid of 2 is about 0.881, and the sigmoid of −2 about 0.119. What probability of a cancellation does the rule give an order with a 10-minute wait?

- [x] About 0.881
- [ ] 2
- [ ] About 0.119
- [ ] About 0.731

The line's output is $z = 1 \times 10 - 8 = 2$, and the sigmoid squashes it to about 0.881. 2 is the line's output before it's squashed, 0.119 would be the probability at 6 minutes, where $z = -2$, and 0.731 is what the rule with $w = 0.5$ and $b = -4$ gives at 10 minutes.

## A rule predicts the probability that a customer will give the driver a good rating, from the wait in minutes. Its $w$ is −0.3. What does the negative weight mean?

- [x] The longer the wait, the less likely a good rating
- [ ] The longer the wait, the more likely a good rating
- [ ] The rule predicts negative probabilities for long waits
- [ ] The rating doesn't depend on the wait

A negative $w$ turns the S around: the line's output drops as the wait grows, and so does the probability. The sigmoid still keeps it between 0 and 1, however long the wait.

## A rule has $w = 0.25$ and $b = -3$. With a threshold of 0.5, from what wait on is an order predicted to be cancelled?

- [x] 12 minutes
- [ ] 0.75 minutes
- [ ] −12 minutes
- [ ] 3 minutes

With a threshold of 0.5, the decision changes where the line's output is 0, and $0.25x - 3 = 0$ at $x = 3 \div 0.25 = 12$. 0.75 multiplies instead of dividing, −12 has the wrong sign, and 3 leaves out the weight.

## The company lowers the threshold from 0.5 to 0.3. What happens?

- [x] More orders are predicted to be cancelled
- [ ] Fewer orders are predicted to be cancelled
- [ ] The predicted probabilities get lower
- [ ] The rule's $w$ and $b$ change

The probabilities stay the same, but an order is now predicted to be cancelled from a probability of 0.3, so the orders between 0.3 and 0.5 join the ones that already were. With $w = 0.5$ and $b = -4$, the boundary moves from 8 minutes to about 6.3. The threshold is a business decision about what to do with the probabilities, and it doesn't change $w$ or $b$.

## A rule with two features is $p = \sigma(0.5 x_1 - 0.25 x_2 - 3)$, where $x_1$ is the wait in minutes and $x_2$ the length of the ride in km. With a threshold of 0.5, which of these orders does it predict will be cancelled?

- [x] A 14-minute wait for an 8 km ride
- [x] An 8-minute wait for a 2 km ride
- [ ] A 10-minute wait for a 12 km ride
- [ ] A 4-minute wait for a 2 km ride

The rule predicts a cancellation wherever the line's output is 0 or more. It's 7 − 2 − 3 = 2 for the first order, 4 − 0.5 − 3 = 0.5 for the second, 5 − 3 − 3 = −1 for the third, and 2 − 0.5 − 3 = −1.5 for the fourth. The long ride makes the 10-minute wait less of a risk than the 8-minute one.
