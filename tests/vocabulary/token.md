# Token

## What is a token?

- [ ] Always exactly one word
- [ ] Always exactly one character
- [x] The unit of text a model reads and writes, such as a word, part of a word or a single character
- [ ] A unit of payment for using an API

A tokenizer splits text into tokens from a fixed vocabulary, and each token becomes a number the model works with. API prices are counted in tokens, but a token isn't a payment.

## How is a rare word usually tokenized?

- [x] It's split into several pieces
- [ ] It's one token, like a common word
- [ ] It's dropped from the text
- [ ] It's spelled out one letter per token, every time

Common words tend to be one token, and rarer words are split into pieces from the vocabulary.

## In English, how much text is a token on average?

- [ ] One letter
- [ ] Exactly one word
- [ ] About four words
- [x] About three quarters of a word

So 1,000 tokens hold roughly 750 English words.

## Which of these are counted in tokens?

- [x] The size of a model's context window
- [x] The size of its training data
- [x] API prices
- [ ] The size of the model itself

A model's size is its number of parameters, as in "a 70-billion-parameter model".

## "Tokenization is unbelievable" might be split into `Token` `ization` ` is` ` un` `believ` `able`. What does this show?

- [x] Many tokens include the space before a word
- [ ] Each syllable is one token
- [x] Less common words are split into pieces
- [ ] Every tokenizer splits this sentence the same way

The exact split depends on the tokenizer.
