---
description: Running a trained model to get outputs, as opposed to training it.
---

# Inference

Training changes a model's weights. Inference uses them, unchanged, to produce outputs. Every time you send a chatbot a message, the model runs inference to write the reply.

A language model writes its reply one [token](token.md) at a time. It reads the whole prompt in one parallel pass, which is relatively fast, but each new token needs another pass through the whole model. So long replies take longer and cost more, which is one reason APIs charge more for output tokens than for input tokens.

Training happens once, but inference runs for every request from every user, so for a popular model the total cost of inference can exceed the cost of training. Making inference cheaper and faster, with smaller models, [quantization](quantization.md), batching and better hardware, is a large part of ML engineering.

**Example:** in the [linear regression lesson](../02-foundations/02-linear-regression.md), finding $w$ and $b$ from the data is training. Using them to predict $y$ for a new $x$ is inference.

**Related:** [Token](token.md) · [Quantization](quantization.md) · [Pretraining](pretraining.md) · [Revenue model](revenue-model.md)
