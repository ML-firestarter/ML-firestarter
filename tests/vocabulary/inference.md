# Inference

## What's the difference between training and inference?

- [ ] Inference is training on new data
- [x] Training changes the weights; inference uses them, unchanged, to produce outputs
- [ ] Inference changes the weights a little with every request
- [ ] Training runs on GPUs and inference on CPUs

Every time you send a chatbot a message, the model runs inference to write the reply. Its weights stay the same.

## Why do APIs charge more for output tokens than for input tokens?

- [x] The prompt is read in one parallel pass, but each output token needs another pass through the whole model
- [ ] Output tokens are longer than input tokens
- [ ] Output tokens are saved to train the next model
- [ ] Input tokens don't go through the model

Long replies take longer and cost more, because the model writes them one token at a time.

## In the linear regression lesson, which step is inference?

- [ ] Finding $w$ and $b$ from the data
- [ ] Computing the gradient of the loss
- [x] Using $w$ and $b$ to predict $y$ for a new $x$
- [ ] Choosing the learning rate

Finding $w$ and $b$ is training. Using them on a new input is inference.

## For a popular model, how can the total cost of inference compare with the cost of training?

- [ ] It's always a small fraction of it
- [ ] Inference is free once the model is trained
- [ ] The two are always about equal
- [x] It can exceed it, because training happens once and inference runs for every request

Training happens once, but inference runs for every request from every user.

## Which of these make inference cheaper or faster?

- [x] Quantization
- [x] Smaller models
- [ ] Longer prompts
- [x] Batching requests together
- [ ] More pretraining

Smaller models, quantization, batching and better hardware all help, and they're a large part of ML engineering. Every extra token in a prompt adds cost.
