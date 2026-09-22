---
description: Short explanations of the terms that keep coming up, linked to each other.
---

# Vocabulary

One page per term. Each starts with a one-line definition, then explains the idea, gives an example and links to related terms.

The training terms fit together like this: [pretraining](pretraining.md) produces a [base model](base-model.md), and [post-training](post-training.md) turns it into an assistant with [SFT](sft.md), then [RLHF](rlhf.md) or [DPO](dpo.md), and often [RLVR](rlvr.md). [LoRA](lora.md) makes [fine-tuning](fine-tuning.md) cheaper, and [quantization](quantization.md) does the same for [inference](inference.md).

Building with models has its own terms. A model reads and writes [tokens](token.md), and everything it works with has to fit in its [context window](context-window.md). [RAG](rag.md) finds relevant documents with [embeddings](embedding.md) and puts them in that window, which reduces [hallucination](hallucination.md). An [agent](agent.md) goes further and uses tools in a loop.

The business terms start with the [revenue model](revenue-model.md), meaning how a product makes money. [ARR](arr.md) and [churn](churn.md) track subscriptions, while [gross margin](gross-margin.md) and [unit economics](unit-economics.md) show whether the business pays off.

<details>
<summary>How to add a term</summary>

Add a file to `notes/vocabulary/` named after the term, such as `perplexity.md`. Terms are listed alphabetically by title, so don't number the file. Start from this template:

```md
---
description: One sentence that defines the term.
---

# Perplexity

A few sentences that explain the idea.

**Example:** a concrete case.

**Related:** [Token](token.md)
```

To add the Polish version, put `perplexity.pl.md` next to it and link to the Polish pages of other terms, such as `token.pl.md`.

</details>
