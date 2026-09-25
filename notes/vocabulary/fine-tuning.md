---
description: Further training of an already trained model on a smaller, focused dataset.
---

# Fine-tuning

Training a large model from scratch takes enormous amounts of data and compute. Fine-tuning (FT) reuses what a trained model already knows and adjusts it with a little more training on a much smaller dataset, usually with a lower learning rate.

It's how a general model is adapted to a task, a domain or a style. [SFT](sft.md) is fine-tuning on examples of good responses, while [RLHF](rlhf.md) and [DPO](dpo.md) fine-tune on preferences instead.

Full fine-tuning updates all of the model's weights. Parameter-efficient methods such as [LoRA](lora.md) freeze the original weights and train a small number of extra ones, which needs far less memory.

Fine-tuning is best at changing how a model behaves. To give it new facts, such as a company's documents, [RAG](rag.md) is usually simpler and easier to keep up to date.

**Example:** fine-tuning a general model on a few thousand past support conversations so it answers customers in the company's tone and format.

**Related:** [Pretraining](pretraining.md) · [SFT](sft.md) · [Base model](base-model.md) · [LoRA](lora.md) · [RAG](rag.md)
