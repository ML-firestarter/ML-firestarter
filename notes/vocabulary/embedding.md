---
description: A list of numbers that represents a piece of text (or an image, or anything else) so that similar things get similar numbers.
---

# Embedding

Computers can't compare meanings directly, but they can compare numbers. An embedding model, trained so that things with similar meanings land close together, turns a piece of content into a vector: a list of hundreds or thousands of numbers. "How do I reset my password?" and "I can't remember my login" share almost no words, but get vectors that point in nearly the same direction.

Closeness is usually measured with cosine similarity, the cosine of the angle between two vectors:

$$
\cos(u, v) = \frac{u \cdot v}{\lVert u \rVert \, \lVert v \rVert}
$$

It's 1 when two vectors point the same way, and lower the less related they are.

Embeddings power semantic search, recommendations, clustering and the retrieval step of [RAG](rag.md). Language models use them inside too: their first layer turns each [token](token.md) into a vector.

**Example:** a help center computes the embedding of every article once and stores the vectors. When a question comes in, it embeds the question and returns the articles whose vectors are closest, even if they use different words than the question.

**Related:** [RAG](rag.md) · [Token](token.md)
