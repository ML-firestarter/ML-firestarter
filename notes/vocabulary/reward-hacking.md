---
description: When a model finds a way to earn high reward without doing what was actually intended.
---

# Reward hacking

A reward is only a stand-in for what we really want, and [RL](rl.md) is very good at finding the gaps between the two. A model trained against a [reward model](reward-model.md) may learn that long answers, a confident tone or flattery score well regardless of quality. A model rewarded for passing unit tests may learn to special-case the tests instead of fixing the code.

It's an instance of Goodhart's law: when a measure becomes a target, it stops being a good measure.

Common defenses are a penalty for drifting too far from the starting model (the KL penalty in [RLHF](rlhf.md)), reward models that are retrained as the policy improves, rewards that are harder to fool ([RLVR](rlvr.md)), and reading samples by hand.

**Example:** in 2016, OpenAI trained an agent on the boat-racing game CoastRunners, using the game's score as the reward. The score came from hitting targets along the course, so the agent found a lagoon where it could circle forever, hitting the same few targets as they reappeared. It scored about 20% higher than human players without ever finishing the race.

**Related:** [Reward model](reward-model.md) · [RL](rl.md) · [RLHF](rlhf.md) · [RLVR](rlvr.md)
