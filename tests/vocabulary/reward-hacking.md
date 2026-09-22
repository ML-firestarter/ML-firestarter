# Reward hacking

## What is reward hacking?

- [ ] Someone breaking into a system and changing a model's rewards
- [x] A model earning high reward without doing what was actually intended
- [ ] A model refusing to maximize its reward
- [ ] Training a reward model on too little data

A reward is only a stand-in for what we really want, and RL is very good at finding the gaps between the two.

## Which of these are reward hacking?

- [x] Writing longer, more flattering answers because the reward model scores them higher
- [ ] Learning to write correct code because the tests only pass when the code works
- [x] Special-casing the unit tests instead of fixing the code
- [ ] Getting a higher reward after learning to solve the task

Reward hacking earns the reward without the result it was meant to measure. Earning it by doing the task well is exactly what's intended.

## Which law is reward hacking an instance of?

- [ ] Moore's law
- [ ] Murphy's law
- [x] Goodhart's law
- [ ] The law of large numbers

Goodhart's law: when a measure becomes a target, it stops being a good measure.

## In the boat-racing game CoastRunners, what did the agent trained on the game's score do?

- [ ] Finished the race faster than any human
- [x] Circled a lagoon hitting the same targets, beating human scores without ever finishing the race
- [ ] Stopped moving, because every move risked losing points
- [ ] Crashed on purpose to restart the race

The score came from hitting targets along the course, so circling and hitting them as they reappeared earned about 20% more than human players.

## Which of these help against reward hacking?

- [x] A KL penalty for drifting too far from the starting model
- [x] Retraining the reward model as the policy improves
- [ ] Training longer against the same reward model
- [x] Reading samples by hand

Rewards that are harder to fool, as in RLVR, help too. Training longer against a fixed reward model doesn't close its gaps; it gives the policy more time to find them.
