# Measuring the error

## A rule gives four orders probabilities of a cancellation of 0.8, 0.4, 0.6 and 0.3, and only the first two were cancelled. With a threshold of 0.5, what's its accuracy?

- [x] 0.5
- [ ] 2
- [ ] 0.525
- [ ] 0.75

The decisions are 1, 0, 1 and 0. The first and the last are right, the second order was cancelled but predicted not to be, and the third wasn't cancelled but was predicted to be: 2 right of 4, or 0.5. 2 is the number of right decisions before it's divided by the number of orders, and 0.525 is the average of the probabilities, which isn't a score at all.

## Why is accuracy a poor score to train with?

- [x] A small change to $w$ or $b$ usually doesn't change it at all
- [x] When a decision is right, it counts a probability of 0.51 the same as 0.99
- [ ] It can't be worked out without a baseline
- [ ] It can be negative

Accuracy only changes when the boundary jumps over an order, so a nudge usually changes nothing, and it can't show training which way is better. It also ignores how sure the rule was. It's still a fine score to report, and it's always between 0 and 1.

## A rule gave an order that wasn't cancelled a probability of 0.75 of being cancelled. $\ln 0.25$ is about −1.386, and $\ln 0.75$ about −0.288. What's the order's penalty?

- [x] About 1.386
- [ ] About 0.288
- [ ] About −1.386
- [ ] 0.25

The order wasn't cancelled, so the rule gave what happened a probability of 1 − 0.75 = 0.25, and the penalty is $-\ln 0.25$, about 1.386. 0.288 uses the probability of a cancellation, which didn't happen, −1.386 is missing the minus, and 0.25 is the probability before its logarithm is taken.

## Which of these predictions gets the biggest penalty?

- [x] A probability of 0.99 for an order that wasn't cancelled
- [ ] A probability of 0.6 for an order that wasn't cancelled
- [ ] A probability of 0.5 for an order that was cancelled
- [ ] A probability of 0.01 for an order that wasn't cancelled

The penalty depends on the probability the rule gave to what happened: 1 − 0.99 = 0.01 for the first order, 0.4 for the second, 0.5 for the third and 0.99 for the fourth. The smaller it is, the bigger the penalty, and $-\ln 0.01$ is about 4.605. Being sure and wrong costs the most.

## In last week's orders, 1 in 4 was cancelled. What probability does the best baseline give every order?

- [x] 0.25
- [ ] 0.5
- [ ] 0.75
- [ ] 0

The baseline ignores the wait and gives every order the same probability, and the one with the lowest log loss is the fraction of the orders that were cancelled. 0.5 is only the best when half of them were cancelled, 0.75 is the fraction that wasn't, and 0 is sure that no order will be cancelled, so the ones that were would get a penalty without limit.

## Two rules make the same decisions on the same orders, so they have the same accuracy. Can their log losses be different?

- [x] Yes, because the log loss also depends on how sure each rule is
- [ ] No, the same decisions always give the same log loss
- [ ] Only if one of the rules has a negative weight
- [ ] Only if some of the orders are right on the boundary

The log loss is worked out from the probabilities, not from the decisions. The rules with $w = 0.5$ and $b = -4$, and $w = 1$ and $b = -8$, both have their boundary at 8 minutes, and make the same decisions, but their log losses on the six orders are 0.496 and 0.716.
