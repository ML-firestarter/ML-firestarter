# RLHF

## What are the three steps of the classic RLHF recipe, in order?

- [ ] A reward model, then SFT, then RL
- [x] SFT, then a reward model, then RL
- [ ] SFT, then RL, then a reward model
- [ ] RL, then SFT, then a reward model

First fine-tune a base model on good responses, then train a reward model on human comparisons, and finally use RL to steer the model toward what the reward model scores highly.

## What is the policy at the start of the RL step?

- [x] The SFT model
- [ ] The base model, before any fine-tuning
- [ ] The reward model
- [ ] A new model trained from scratch

The SFT model, now called the policy, writes the responses that get scored.

## In the RL step, who writes the responses and what scores them?

- [ ] People write them and the reward model scores them
- [ ] The policy writes them and people score each one
- [x] The policy writes them and the reward model scores them
- [ ] The reward model writes them and the policy scores them

People only compare responses to train the reward model. After that, the reward model scores the policy's responses with no person in the loop.

## What does the KL penalty do?

- [ ] It makes the responses shorter
- [x] It penalizes the policy for drifting away from the SFT model
- [ ] It speeds up training
- [ ] It rewards the policy for agreeing with people

Without it, the policy drifts toward odd outputs that happen to fool the reward model, which is reward hacking. $\beta$ sets how strongly drifting is penalized.

## What is RLAIF?

- [ ] RLHF without the SFT step
- [ ] RLHF without a reward model
- [ ] RLHF with rewards from checking the answer
- [x] RLHF with an AI judge in place of the human labelers

Skipping the reward model and the RL loop altogether is DPO, and rewards from checking the answer are RLVR.
