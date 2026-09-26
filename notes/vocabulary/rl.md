---
description: Reinforcement learning. Learning by trial and error, from rewards rather than correct answers.
---

# RL

In [supervised learning](../04-foundations/01-what-is-machine-learning.md#three-kinds-of-learning), every example comes with the right answer. In reinforcement learning nobody provides the right answer. The learner only gets a reward that says how well things went, sometimes long after the actions that caused it, and has to work out which actions deserve the credit.

The pieces:

- **Agent**: the learner. It acts according to its [policy](policy.md).
- **Environment**: the world it acts in.
- **State**: what the agent observes.
- **Action**: what it does.
- **Reward**: a number that says how good the outcome was.

The goal is a policy that collects as much reward as possible. RL was central to game-playing systems such as AlphaGo. For language models it's used in [RLHF](rlhf.md), where a [reward model](reward-model.md) supplies the reward, and in [RLVR](rlvr.md), where the reward comes from checking the answer. PPO and GRPO are two widely used algorithms for this.

**Example:** an agent learning a video game sees the screen (the state), presses buttons (actions) and gets the change in score as its reward.

**Related:** [Policy](policy.md) · [Reward model](reward-model.md) · [RLHF](rlhf.md) · [RLVR](rlvr.md) · [Reward hacking](reward-hacking.md)
