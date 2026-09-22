---
description: Reinforcement learning from human feedback. Using RL to steer a model toward the responses people prefer.
---

# RLHF

RLHF is the technique that made models like InstructGPT and the original ChatGPT helpful and easy to talk to. The classic recipe has three steps:

1. **[SFT](sft.md)**: fine-tune a [base model](base-model.md) on examples of good responses.
2. **[Reward model](reward-model.md)**: collect human comparisons between responses and train a model to predict which one people prefer.
3. **[RL](rl.md)**: let the SFT model, now called the [policy](policy.md), write responses; score them with the reward model; and update the policy toward higher scores, typically with the PPO algorithm.

The RL step maximizes the reward minus a penalty for drifting away from the SFT model:

$$
\max_{\pi} \; \mathbb{E}\big[ r(x, y) \big] - \beta \, \mathrm{KL}\big( \pi \,\|\, \pi_\text{SFT} \big)
$$

The KL divergence measures how far the policy's probabilities have moved from the SFT model's, and $\beta$ sets how strongly that's penalized. Without the penalty, the policy drifts toward odd outputs that happen to fool the reward model, which is called [reward hacking](reward-hacking.md).

Variants replace the human labelers with an AI judge (RLAIF), or skip the reward model and the RL loop altogether ([DPO](dpo.md)).

**Example:** asked "What does a KeyError mean in Python?", one answer explains that the key isn't in the dictionary and shows `d.get(key)`; another just says "check your keys". Labelers prefer the first, the reward model learns that preference, and RL makes the policy write more answers like it.

**Related:** [SFT](sft.md) · [Reward model](reward-model.md) · [Policy](policy.md) · [DPO](dpo.md) · [Reward hacking](reward-hacking.md)
