---
description: The unit of text a language model reads and writes, such as a word, part of a word or a single character.
---

# Token

Models don't see letters or words directly. A tokenizer splits text into tokens from a fixed vocabulary, usually tens of thousands to a few hundred thousand entries, and each token becomes a number the model works with. Common words tend to be one token; rarer words are split into pieces.

Tokens are the unit behind many numbers you'll see: the size of a model's [context window](context-window.md), the size of its training data ("trained on 15 trillion tokens") and API prices. In English, a token is about three quarters of a word on average.

**Example:** "Tokenization is unbelievable" might be split into `Token` `ization` ` is` ` un` `believ` `able`. Many tokens include the space before a word, and the exact split depends on the tokenizer.

**Related:** [Context window](context-window.md) · [Pretraining](pretraining.md) · [Base model](base-model.md) · [Inference](inference.md) · [Revenue model](revenue-model.md)
