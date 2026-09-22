---
description: Everything done to a model after pretraining to make it helpful, safe and skilled.
---

# Post-training

[Pretraining](pretraining.md) gives a model broad knowledge and a feel for language. Post-training shapes how it uses them: following instructions, holding a conversation, declining harmful requests, reasoning step by step and using tools.

A typical recipe:

1. [SFT](sft.md) on examples of good responses.
2. Preference tuning with [RLHF](rlhf.md) or [DPO](dpo.md), so the model favors the answers people like.
3. Often [RLVR](rlvr.md) for skills with checkable answers, such as math and code.

Post-training has traditionally used a small fraction of pretraining's compute, though reasoning models spend a growing share on RL. Either way, it decides much of how a model behaves.

**Example:** a [base model](base-model.md) and the chat model built from it have largely the same knowledge. The difference in how they respond comes from post-training.

**Related:** [Pretraining](pretraining.md) · [Base model](base-model.md) · [Fine-tuning](fine-tuning.md)
