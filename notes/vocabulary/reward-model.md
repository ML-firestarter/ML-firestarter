---
description: A model that scores how good a response is, trained on people's preferences. Often shortened to RM.
---

# Reward model

People are inconsistent when asked to score a response out of 10, but much more reliable at saying which of two responses is better. So preference data is collected as comparisons: a prompt, two responses, and the one a person preferred.

The reward model is usually a language model whose final layer is replaced by one that outputs a single number, the score $r(x, y)$ for response $y$ to prompt $x$. It's trained so that the preferred response $y_w$ scores higher than the rejected one $y_l$:

$$
\mathcal{L} = -\log \sigma\big( r(x, y_w) - r(x, y_l) \big)
$$

where $\sigma$ is the sigmoid function. The bigger the gap in the right direction, the smaller the loss.

Once trained, it can score millions of responses during [RLHF](rlhf.md) with no person in the loop. But it only approximates human judgment, and the [policy](policy.md) will exploit its mistakes if it can; see [reward hacking](reward-hacking.md).

**Example:** for "How do I reverse a list in Python?", an answer that shows `items[::-1]` and `items.reverse()` and explains the difference should score higher than "Use a loop."

**Related:** [RLHF](rlhf.md) · [Reward hacking](reward-hacking.md) · [DPO](dpo.md) · [Policy](policy.md)
