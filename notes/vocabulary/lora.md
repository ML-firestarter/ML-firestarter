---
description: Low-rank adaptation. A cheap way to fine-tune a large model by training small added matrices while its own weights stay frozen.
---

# LoRA

Full [fine-tuning](fine-tuning.md) updates every weight of a model. That takes memory for all the weights, their gradients and the optimizer's state, and every fine-tuned version is a full copy of the model. LoRA (low-rank adaptation, Hu et al., 2021) freezes the original weights instead and trains a small correction that's added to them.

For a weight matrix $W$ with $d$ rows and $k$ columns, the correction is the product of two thin matrices:

$$
W' = W + BA, \qquad B \in \mathbb{R}^{d \times r}, \quad A \in \mathbb{R}^{r \times k}
$$

The rank $r$ is small, often between 8 and 64, so $B$ and $A$ together hold $r(d + k)$ numbers instead of $dk$. Only $B$ and $A$ are trained. $B$ starts at zero, so training starts from exactly the original model.

The trained matrices form an *adapter*, usually between a few megabytes and a few hundred, that's stored separately. One base model can serve many adapters, for example one per customer or task. $BA$ can also be added into $W$ once training is done, so the model runs exactly as fast as before. QLoRA (Dettmers et al., 2023) keeps the frozen model [quantized](quantization.md) to 4 bits while the adapters train, which made it possible to fine-tune a 65-billion-parameter model on a single 48 GB GPU.

**Example:** a 4096 × 4096 weight matrix holds about 16.8 million numbers. A rank-8 LoRA for it holds 8 × (4096 + 4096) = 65,536, about 0.4% as many.

**Related:** [Fine-tuning](fine-tuning.md) · [SFT](sft.md) · [Quantization](quantization.md) · [Base model](base-model.md)
