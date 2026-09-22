---
description: Retrieval-augmented generation. Finding documents relevant to a question and giving them to the model along with it, so it answers from them.
---

# RAG

A model only knows what was in its training data, which stops at some date and doesn't include your private documents. Retrieval-augmented generation fixes this when the question is asked: first find the passages most relevant to it, then put them in the prompt and have the model answer from them. The name comes from a 2020 paper by Lewis et al.

A typical setup has three steps:

1. **Index**: split the documents into chunks of a few hundred words, compute an [embedding](embedding.md) of each chunk and store them in a vector database. This is done ahead of time.
2. **Retrieve**: embed the question and find the chunks whose embeddings are closest, often together with ordinary keyword search.
3. **Generate**: put the best chunks in the prompt with the question, and ask the model to answer only from them and to cite them.

Answers stay current without retraining: update the documents and the answers follow. Grounding the model in real text reduces [hallucination](hallucination.md), and the citations let readers check the answers. But RAG is only as good as its retrieval: if the right passage isn't found, the model can't use it. Splitting documents into chunks also keeps what's retrieved small enough to fit in the [context window](context-window.md).

RAG is the usual way to give a model new knowledge. [Fine-tuning](fine-tuning.md) is better for changing how it behaves, such as its tone or format.

**Example:** an HR assistant is asked "How many vacation days do new employees get?" It retrieves the passage "Full-time employees get 20 days of paid vacation per year, starting in their first year" from the handbook, and answers "20 days a year" with a link to that page.

**Related:** [Embedding](embedding.md) · [Hallucination](hallucination.md) · [Context window](context-window.md) · [Fine-tuning](fine-tuning.md)
