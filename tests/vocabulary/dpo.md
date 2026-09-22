# DPO

## What data does DPO learn from?

- [ ] Prompts paired with one ideal response each
- [x] Prompts, each with a response people preferred and one they rejected
- [ ] Rewards from checking whether an answer is correct
- [ ] Raw text from the web

Like RLHF, DPO learns from preferences. SFT learns from ideal responses, and RLVR from checked answers.

## Which steps of RLHF does DPO replace with a single loss?

- [x] Training a reward model
- [ ] SFT on examples of good responses
- [x] Running RL against the reward model
- [ ] Collecting the preference data

DPO still needs preference data, and it usually starts from the SFT model. It replaces the reward model and the RL step with one loss that widens the gap between the preferred and the rejected response.

## What is $\pi_\text{ref}$ in the DPO loss?

- [ ] The model being trained
- [ ] The reward model
- [x] A frozen copy of the starting model, usually the SFT model
- [ ] The preferred response

Each response's probability is measured against the frozen copy's, and the loss widens the gap between the preferred and the rejected response.

## What does $\beta$ control in DPO?

- [x] How strongly the model is held close to the reference model
- [ ] The learning rate
- [ ] How many pairs of responses are used per step
- [ ] How long the responses can be

It plays the same role as the KL penalty in RLHF.

## Why did DPO become popular, especially for open models?

- [ ] It needs no preference data
- [ ] It gives the model new knowledge
- [x] It optimizes the same objective as RLHF, but trains like ordinary supervised learning
- [ ] It's the only method that works without SFT

The DPO paper (Rafailov et al., 2023) showed that it optimizes the same objective as RLHF, while being simpler, cheaper and more stable to train.
