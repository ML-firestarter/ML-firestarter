---
description: The maximum amount of text, counted in tokens, that a language model can take into account at once.
---

# Context window

Everything a model uses to write a response has to fit in its context window: the instructions, the conversation so far, any documents or tool results, and the response itself as it's being written. It's measured in [tokens](token.md). Windows have grown from about 2,000 tokens in GPT-3 (2020) to hundreds of thousands, and to a million or more in some models.

The model has no memory between requests. A chat app makes it seem to remember by sending the whole conversation again with every message, so long conversations take up more of the window, and cost more, as they grow. When the window is full, something has to give: old messages are dropped or summarized, and documents are cut down or searched with [RAG](rag.md) instead of being pasted in whole.

A large window doesn't guarantee that the model uses everything in it well. Models can miss details buried in the middle of a long context, and every extra token adds to the cost and time of [inference](inference.md).

**Example:** with a 200,000-token window and about three quarters of a word per token, a model can take in roughly 150,000 words of English at once, about the length of two novels.

**Related:** [Token](token.md) · [RAG](rag.md) · [Inference](inference.md) · [Agent](agent.md)
