---
description: In reinforcement learning, the strategy that chooses an action in each situation. For a language model, it's the model itself.
---

# Policy

A policy maps what an agent observes (its *state*) to what it does (an *action*), usually as probabilities over the possible actions, written $\pi(a \mid s)$. [Reinforcement learning](rl.md) adjusts the policy so that actions that lead to more reward become more likely.

For a language model, the state is the prompt plus the text written so far, and an action is the next [token](token.md). The model's next-token probabilities are exactly a policy, which is why papers about [RLHF](rlhf.md) call the model being trained "the policy".

**Example:** a chess program's policy looks at the board and gives each legal move a probability. Moves that led to wins in training become more likely over time.

**Related:** [RL](rl.md) · [Reward model](reward-model.md) · [RLHF](rlhf.md)
