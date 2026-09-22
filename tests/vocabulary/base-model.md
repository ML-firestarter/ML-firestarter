# Base model

## What has a base model learned to do?

- [x] Predict the next token of text
- [ ] Follow instructions and hold a conversation
- [ ] Decline harmful requests
- [ ] Look up facts in a database

Pretraining teaches it one thing, predicting the next token, across a huge amount of text. Following instructions comes later, with post-training.

## You give a base model "Write a haiku about the sea." What might it do?

- [ ] Refuse, because it hasn't been taught to follow instructions
- [x] Continue with "Write a haiku about the mountains.", as if the prompt were part of a list of writing exercises
- [ ] Reply with an error message
- [ ] Always write the haiku, because it knows what a haiku is

A base model continues text, and another writing prompt is a likely continuation. It may write the haiku, but nothing makes it treat the prompt as an instruction.

## What turns a base model into a chat model?

- [ ] More pretraining on more text
- [ ] A longer context window
- [x] Post-training
- [ ] Quantization

Post-training turns a base model into an instruct or chat model that follows instructions and holds a conversation.

## Where does a base model's knowledge come from?

- [ ] Post-training on examples of good answers
- [x] Predicting the next token across a huge amount of text in pretraining
- [ ] Facts its developers entered by hand
- [ ] A search engine it queries while answering

Predicting text well takes grammar, facts and some reasoning, so a base model knows a lot. Post-training changes how it uses that knowledge.

## What are base models still good for?

- [ ] Chatting with users, because they're safer than chat models
- [ ] Answering questions about recent events
- [ ] Following instructions more precisely than chat models
- [x] Serving as the starting point for your own fine-tuning

A base model knows a lot but isn't an assistant yet, which makes it a good starting point for fine-tuning of your own.
