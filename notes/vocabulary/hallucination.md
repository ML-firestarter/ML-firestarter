---
description: A false or made-up statement that a language model presents as fact.
---

# Hallucination

A language model is trained to produce plausible text, and a plausible answer isn't always a true one. When the model doesn't know something, it may fill the gap with a fluent, confident answer that is wrong: a quote nobody said, a paper that doesn't exist, a wrong date, or a function that isn't in the library. That's a hallucination.

It happens because [pretraining](pretraining.md) rewards text that looks right, and the model has no built-in way to check facts or to tell what it knows from what it's guessing. [Post-training](post-training.md) can teach it to say "I don't know" more often, but that makes hallucinations rarer rather than impossible.

Ways to reduce them:

- Give the model the facts in the prompt, for example with [RAG](rag.md), and ask it to answer only from them and to cite them.
- Let it check its own work with tools, such as a search engine or running the code it wrote (see [agent](agent.md)).
- Check important claims yourself, especially names, numbers, quotes and references.

**Example:** asked for sources on a niche topic, a model lists three papers with plausible titles, authors and years. Two of them exist; the third was never written.

**Related:** [RAG](rag.md) · [Pretraining](pretraining.md) · [Post-training](post-training.md) · [Agent](agent.md)
