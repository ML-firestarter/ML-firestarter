---
description: Reinforcement learning with verifiable rewards. RL where the reward comes from automatically checking the answer.
---

# RLVR

Some tasks have answers a program can check. A math problem has a known final answer, code can be run against tests, a puzzle has a solution. For these tasks the reward can simply be 1 when the answer is correct and 0 when it isn't, with no [reward model](reward-model.md) needed.

Such rewards are cheap, consistent, and much harder to fool than a learned reward model, though not impossible to fool; see [reward hacking](reward-hacking.md). Training with RL on many checkable problems is how reasoning models learn to think at length, check their work and try another approach when stuck. DeepSeek-R1 is a well-known, openly documented example. The term itself comes from Ai2's Tülu 3 work in 2024.

**Example:** the model gets "What is 17 × 24?" and writes out its reasoning. If its final answer is 408, the reward is 1; otherwise it's 0. Over many problems, the reasoning habits that lead to right answers become more likely.

**Related:** [RL](rl.md) · [Reward model](reward-model.md) · [Reward hacking](reward-hacking.md) · [Post-training](post-training.md)
