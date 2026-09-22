# Reward model

## Why is preference data collected as comparisons rather than scores out of 10?

- [x] People are much more reliable at saying which of two responses is better
- [ ] Comparisons don't need people at all
- [ ] A reward model can't output a number
- [ ] Scores out of 10 take too much storage

People are inconsistent when they score a response out of 10, but consistent when they pick the better of two.

## What does a reward model output?

- [ ] A better version of the response
- [ ] The probability of the next token
- [ ] Yes or no: whether the answer is correct
- [x] A single number: the score $r(x, y)$ for response $y$ to prompt $x$

It's usually a language model whose final layer is replaced by one that outputs a single number.

## What is a reward model trained to do?

- [ ] Give every response a score of 10
- [x] Score the preferred response higher than the rejected one
- [ ] Match the scores out of 10 that people gave
- [ ] Score shorter responses higher

The loss $-\log \sigma\big(r(x, y_w) - r(x, y_l)\big)$ gets smaller the bigger the gap in the right direction.

## What makes a trained reward model useful in RLHF?

- [ ] It writes the responses the policy learns from
- [ ] It checks each answer against a known solution
- [x] It can score millions of responses with no person in the loop
- [ ] It makes the policy immune to reward hacking

Collecting a person's judgment for every response during RL would be far too slow and expensive.

## What's the risk of training a policy against a reward model?

- [ ] The reward model gradually forgets its training
- [x] The reward model only approximates human judgment, and the policy will exploit its mistakes
- [ ] None, because the reward model learned from people
- [ ] The policy stops writing anything

That's reward hacking: high scores from the reward model without the quality they were meant to measure.
