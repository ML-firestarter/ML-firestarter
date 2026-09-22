# Post-training

## What does post-training mainly shape?

- [ ] Most of the facts a model knows
- [x] How the model uses what it knows: following instructions, holding a conversation, declining harmful requests
- [ ] The size of the context window
- [ ] The tokenizer's vocabulary

Pretraining gives a model broad knowledge and a feel for language. Post-training decides much of how it behaves.

## What usually comes first in post-training?

- [x] SFT on examples of good responses
- [ ] Preference tuning with RLHF or DPO
- [ ] RLVR on math and code
- [ ] Pretraining

The typical recipe is SFT, then preference tuning with RLHF or DPO, and often RLVR. Pretraining comes before post-training.

## Which step trains skills with checkable answers, such as math and code?

- [ ] SFT
- [ ] DPO
- [x] RLVR
- [ ] Pretraining

RLVR rewards answers that a program can check.

## A base model and the chat model built from it respond very differently. Why?

- [ ] The chat model was pretrained on more text
- [x] Post-training changed how it behaves, while their knowledge stayed largely the same
- [ ] The chat model is a bigger model
- [ ] The chat model looks up its answers on the web

The difference in how they respond comes from post-training.

## How much compute does post-training use, compared with pretraining?

- [ ] Always more than pretraining
- [ ] None, because post-training doesn't change the weights
- [ ] Exactly the same amount
- [x] Traditionally a small fraction, though reasoning models spend a growing share on RL

Post-training still decides much of how a model behaves.
