# Hallucination

## What is a hallucination?

- [ ] A response the model refuses to give
- [ ] A made-up story that the user asked for
- [x] A false or made-up statement that a model presents as fact
- [ ] An answer that doesn't fit in the context window

When a model doesn't know something, it may fill the gap with a fluent, confident answer that is wrong. A story you asked for isn't a hallucination, because it isn't presented as fact.

## Why do language models hallucinate?

- [x] Pretraining rewards text that looks right, and the model has no built-in way to check facts
- [ ] They're trained mostly on false text
- [ ] Quantization adds random errors to their answers
- [ ] Their context window is too small to hold the facts

A plausible answer isn't always a true one, and the model can't tell what it knows from what it's guessing.

## Can post-training stop hallucinations completely?

- [ ] Yes, by teaching the model to say "I don't know"
- [ ] Yes, with enough RLHF
- [x] No: it makes them rarer, not impossible
- [ ] No, because post-training makes them more common

Post-training can teach a model to say "I don't know" more often, but that only makes hallucinations rarer.

## Which of these reduce hallucinations?

- [x] Giving the model the facts in the prompt and asking it to cite them
- [ ] Asking the model to sound more confident
- [x] Letting the model check its work with tools, such as a search engine or running its code
- [ ] Asking for longer answers

Grounding the model in real text, for example with RAG, and letting it check its work both help. So does checking important claims yourself.

## A model gives you three papers on a niche topic, with plausible titles, authors and years. What should you do?

- [ ] Trust them, because the details are so specific
- [ ] Ask the model whether it's sure, and trust its answer
- [x] Check that each paper exists before you rely on it
- [ ] Trust them, because the model would say if it didn't know

Plausible details aren't evidence. In the lesson's example, two of the three papers exist and the third was never written. Check names, numbers, quotes and references yourself.
