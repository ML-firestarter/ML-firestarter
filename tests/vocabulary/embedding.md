# Embedding

## What is an embedding?

- [ ] The ID number of a token in the model's vocabulary
- [x] A list of numbers that represents a piece of content, so that similar things get similar numbers
- [ ] A compressed copy of a text that can be turned back into it
- [ ] A short summary of a text written by the model

An embedding model is trained so that things with similar meanings land close together.

## "How do I reset my password?" and "I can't remember my login" share almost no words. What about their embeddings?

- [ ] They're far apart, because the words are different
- [ ] They're identical
- [x] They point in nearly the same direction
- [ ] They can't be compared, because the sentences have different lengths

Embeddings capture meaning rather than wording, so two ways of asking the same thing get similar vectors.

## Two vectors point in exactly the same direction. What's their cosine similarity?

- [x] 1
- [ ] 0
- [ ] −1
- [ ] It depends on how long the vectors are

Cosine similarity is the cosine of the angle between the vectors. It's 1 when they point the same way, and lower the less related they are. Dividing by both lengths means only the direction counts.

## What are embeddings used for?

- [x] Semantic search
- [ ] Checking whether a model's answer is correct
- [x] Finding the passages to use in RAG
- [x] Turning each token into a vector in a language model's first layer

Embeddings power semantic search, recommendations, clustering and the retrieval step of RAG, and language models use them inside too.

## A help center wants to find the right articles for each question. What does it embed, and when?

- [ ] Only the questions, then searches the articles by keyword
- [x] Every article once, ahead of time, and each question as it comes in
- [ ] Every article again for each new question
- [ ] Only the articles, then asks the model to pick one

The article vectors are computed once and stored. Each question is embedded when it arrives, and the articles with the closest vectors are returned, even if they use different words.
