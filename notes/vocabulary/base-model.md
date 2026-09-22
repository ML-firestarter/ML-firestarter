---
description: A model fresh out of pretraining. It's good at continuing text but hasn't been taught to follow instructions.
---

# Base model

A base model has learned one thing: predicting the next [token](token.md) of text, across a huge amount of it. That makes it knowledgeable, but not yet an assistant. Give it a question and it may answer, or it may carry on with more questions, because that's also a likely continuation.

[Post-training](post-training.md) turns a base model into an *instruct* or *chat* model that follows instructions and holds a conversation. Base models are still useful as the starting point for your own [fine-tuning](fine-tuning.md).

**Example:** given "The capital of France is", a base model continues with "Paris". Given "Write a haiku about the sea.", it may add "Write a haiku about the mountains." as if continuing a list of writing exercises.

**Related:** [Pretraining](pretraining.md) · [Post-training](post-training.md) · [SFT](sft.md)
