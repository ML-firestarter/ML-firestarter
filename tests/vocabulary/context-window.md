# Context window

## What has to fit in the context window?

- [x] The instructions and the conversation so far
- [x] Documents and tool results
- [x] The response, as it's being written
- [ ] The model's training data

Everything the model uses to write a response has to fit, including the response itself. The training data shaped the model's weights; it isn't in the window.

## How does a chat app make a model seem to remember the conversation?

- [ ] The model keeps a memory of each user between requests
- [ ] It fine-tunes the model after every message
- [x] It sends the whole conversation again with every message
- [ ] The model stores the conversation in its weights

The model has no memory between requests. Because the whole conversation is sent every time, long chats take up more of the window, and cost more, as they grow.

## The context window is full. What can an app do?

- [x] Drop or summarize old messages
- [ ] Quantize the model to make the window bigger
- [x] Search the documents with RAG instead of pasting them in whole
- [ ] Nothing: the model simply reads past the end of the window

Something has to give: old messages are dropped or summarized, and documents are cut down or searched with RAG. Quantization shrinks the weights, not the text a model can take in.

## About how many English words fit in a 200,000-token window?

- [ ] About 270,000
- [ ] About 200,000
- [x] About 150,000
- [ ] About 50,000

A token is about three quarters of an English word, so 200,000 tokens hold roughly 150,000 words, about the length of two novels.

## Does a bigger context window mean the model uses everything in it well?

- [ ] Yes, every token counts the same
- [x] No: models can miss details in the middle of a long context, and every token adds cost and time
- [ ] Yes, as long as the text is in English
- [ ] No, because a model only reads the last 2,000 tokens

A large window doesn't guarantee that the model uses it well, and each extra token makes inference slower and more expensive.
