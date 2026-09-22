---
description: Direct preference optimization. Learning from pairs of better and worse answers, without a reward model or RL.
---

# DPO

Like [RLHF](rlhf.md), DPO learns from preference data: prompts, each with a response people preferred and one they rejected. RLHF first trains a [reward model](reward-model.md) on this data and then runs [RL](rl.md). DPO replaces both steps with a single loss that widens the gap between the preferred and the rejected response, measuring each against a frozen copy of the starting model (usually the [SFT](sft.md) model):

$$
\mathcal{L}_\text{DPO} = -\log \sigma\left( \beta \log \frac{\pi_\theta(y_w \mid x)}{\pi_\text{ref}(y_w \mid x)} - \beta \log \frac{\pi_\theta(y_l \mid x)}{\pi_\text{ref}(y_l \mid x)} \right)
$$

Here $x$ is the prompt, $y_w$ and $y_l$ are the preferred and rejected responses, $\pi_\theta$ is the model being trained, $\pi_\text{ref}$ is the frozen copy, $\sigma$ is the sigmoid function, and $\beta$ sets how strongly the model is held close to the reference, like the KL penalty in RLHF.

The DPO paper (Rafailov et al., 2023) showed that this optimizes the same objective as RLHF, while training like ordinary supervised learning: simpler, cheaper and more stable. That made it a popular choice, especially for open models.

**Example:** for "Explain recursion to a 10-year-old", people preferred an answer built on Russian dolls, each opening to reveal a smaller one, over a textbook definition. DPO nudges the model toward answers like the first.

**Related:** [RLHF](rlhf.md) · [Reward model](reward-model.md) · [SFT](sft.md)
