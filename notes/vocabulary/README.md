---
description: Short explanations of the terms that keep coming up, linked to each other.
---

# Vocabulary

One page per term. Each starts with a one-line definition, then explains the idea, gives an example and links to related terms.

The training terms fit together like this: [pretraining](pretraining.md) produces a [base model](base-model.md), and [post-training](post-training.md) turns it into an assistant with [SFT](sft.md), then [RLHF](rlhf.md) or [DPO](dpo.md), and often [RLVR](rlvr.md). There are business terms too, starting with [revenue model](revenue-model.md).

<details>
<summary>How to add a term</summary>

Add a file to `notes/vocabulary/` named after the term, such as `lora.md`. Terms are listed alphabetically by file name, so don't number them. Start from this template:

```md
---
description: One sentence that defines the term.
---

# LoRA

A few sentences that explain the idea.

**Example:** a concrete case.

**Related:** [Fine-tuning](fine-tuning.md)
```

</details>
