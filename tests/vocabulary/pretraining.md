# Pretraining

## What does a language model do at every position of the text during pretraining?

- [ ] Answers a question written by a person
- [x] Predicts the next token
- [ ] Compares two possible responses
- [ ] Summarizes the text so far

It reads trillions of tokens of text, such as web pages, books and code, and predicts the next token at every position.

## Why is pretraining called *self-supervised*?

- [ ] The model writes its own training data
- [ ] The model checks its answers with tools
- [ ] It doesn't need a loss function
- [x] The text itself supplies the answers, so no one has to label anything

The next token is the answer, and it's already in the text.

## Treating each word as one token, what training examples does "The cat sat on the mat" give?

- [ ] One: the whole sentence
- [x] Several: predict "cat" after "The", "sat" after "The cat", and so on
- [ ] None, because nobody labeled the sentence
- [ ] Two: the first half and the second half

Every position is an example, so one sentence gives several at once.

## What's the loss in pretraining?

- [ ] Mean squared error between the predicted and the actual words
- [ ] A score from a reward model
- [x] Cross-entropy, which is low when the model gave a high probability to the token that actually came next
- [ ] The number of words the model got wrong

Gradient descent lowers it, just like in the linear regression lesson, only with billions of parameters instead of two.

## Which training stage is usually the most expensive for a large model?

- [x] Pretraining
- [ ] SFT
- [ ] RLHF
- [ ] DPO

Pretraining takes weeks or months on thousands of GPUs. Post-training has traditionally used a small fraction of that.
