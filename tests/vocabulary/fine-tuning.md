# Fine-tuning

## What is fine-tuning?

- [ ] Training a model from scratch on a small, focused dataset
- [x] Further training of an already trained model on a smaller, focused dataset
- [ ] Putting a few examples in the prompt
- [ ] Rewriting a model's instructions without any training

Fine-tuning reuses what a trained model already knows and adjusts it with a little more training, usually with a lower learning rate.

## Which of these are fine-tuning?

- [x] SFT
- [ ] Pretraining
- [x] RLHF
- [x] DPO
- [ ] RAG

SFT fine-tunes on examples of good responses, and RLHF and DPO on preferences. Pretraining is the stage before fine-tuning, and RAG doesn't train the model at all.

## A company wants its assistant to answer from internal documents that change every week. What's usually the better choice?

- [ ] Full fine-tuning on the documents every week
- [x] RAG
- [ ] LoRA fine-tuning on the documents
- [ ] A bigger base model

Fine-tuning is best at changing how a model behaves. To give it new facts, RAG is usually simpler and easier to keep up to date.

## How does full fine-tuning differ from LoRA?

- [x] Full fine-tuning updates all the weights; LoRA freezes them and trains a small number of extra ones
- [ ] Full fine-tuning needs data; LoRA doesn't
- [ ] LoRA updates all the weights, just with a lower learning rate
- [ ] They do the same thing, but LoRA runs without a GPU

Parameter-efficient methods such as LoRA train far fewer weights, so they need far less memory.

## Which goal suits fine-tuning best?

- [ ] Knowing today's prices
- [ ] Answering from documents written after the model was trained
- [ ] Fitting a longer document into the prompt
- [x] Answering customers in the company's tone and format

Fine-tuning changes how a model behaves, for example by training it on a few thousand past support conversations. Fresh facts are a job for RAG.
