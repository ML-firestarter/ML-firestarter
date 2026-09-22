# RLVR

## What makes a reward verifiable?

- [ ] A person has checked the reward model
- [ ] The model says it's confident in its answer
- [x] A program can check the answer, for example against a known result or by running tests
- [ ] The reward model is very accurate

Some tasks have answers a program can check, so the reward can simply be 1 for a correct answer and 0 otherwise.

## Asked "What is 17 × 24?", the model reasons it through and answers 408. What's its reward?

- [x] 1
- [ ] 0
- [ ] 408
- [ ] Whatever score a reward model gives it

17 × 24 = 408, so the answer is correct and the reward is 1. Any other final answer would get 0.

## Which tasks suit RLVR?

- [x] Math problems with a known final answer
- [ ] Writing a friendly email
- [x] Code that can be run against tests
- [ ] Summarizing a novel in an engaging way

RLVR needs answers a program can check. Friendliness or an engaging style are matters of judgment, where preferences, as in RLHF or DPO, work better.

## Can a verifiable reward be hacked?

- [ ] No, because a program checks it
- [ ] Yes, more easily than a reward model
- [x] Yes, though it's much harder to fool than a learned reward model
- [ ] Only when the model is small

A model rewarded for passing unit tests may learn to special-case the tests instead of fixing the code.

## What do reasoning models learn from RL on many checkable problems?

- [ ] New facts about the world
- [ ] To copy human-written solutions word for word
- [ ] To keep their answers as short as possible
- [x] To think at length, check their work and try another approach when stuck

DeepSeek-R1 is a well-known, openly documented example.
