# RAG

## What problem does RAG solve?

- [ ] Models are too slow to answer long questions
- [x] A model only knows its training data, which stops at some date and doesn't include your private documents
- [ ] Models can't follow instructions
- [ ] Models forget what they learned in pretraining

RAG finds the passages relevant to a question when it's asked and puts them in the prompt, so the model answers from them.

## Which step of RAG is done ahead of time?

- [ ] Retrieving the chunks closest to the question
- [ ] Embedding the question
- [x] Indexing: splitting the documents into chunks, embedding them and storing the vectors
- [ ] Generating the answer

Retrieval and generation happen when a question comes in. The index is built beforehand.

## Why are documents split into chunks of a few hundred words?

- [ ] So the model can be fine-tuned on them
- [ ] So each chunk is one token
- [ ] So the documents can't change later
- [x] So what's retrieved is small enough to fit in the context window

The best chunks go into the prompt together with the question, and all of it has to fit in the window.

## A company updates its handbook. What does it need to do so its RAG assistant answers from the new version?

- [x] Update the documents in the index; no retraining needed
- [ ] Fine-tune the model on the new handbook
- [ ] Pretrain a new model
- [ ] Wait for the next version of the model

Answers stay current without retraining: update the documents and the answers follow.

## What's RAG's main weakness?

- [ ] It makes hallucinations more common
- [ ] It can't cite its sources
- [x] It's only as good as its retrieval: if the right passage isn't found, the model can't use it
- [ ] The model has to be retrained for every question

Grounding the answers in real text reduces hallucination, and citations let readers check them. But everything depends on finding the right passage.
