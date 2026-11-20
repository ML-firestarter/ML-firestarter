---
description: Change a picture a little, on purpose, so that a network reads it wrong. FGSM, PGD, attacks aimed at a class, the norms that measure a change, and attacks on embeddings, with code that runs in the page.
---

# Adversarial examples

A network that reads 94% of the digits right can be made to read nearly none of them, with changes to the pictures that a person would hardly notice. A picture changed like that, on purpose, is an **adversarial example**. This chapter makes them. It attacks the network that reads the taxi company's receipts, measures how far its accuracy falls, and looks at what it takes for a network to hold up.

Each attack is a few lines of PyTorch, and they run in your browser, like the rest of the course. All they need is the slope of the loss for the picture, which [Autograd](../05-pytorch/02-autograd.md#the-slope-for-an-input) worked out for a ride.

The chapter builds on [PyTorch](../05-pytorch/). You should know how the network of [Classifying images](../05-pytorch/09-classifying-images.md) is trained and how it reads a digit, and be comfortable with tensors, `torch.autograd.grad` and `clamp`.

## What you'll learn

1. [Fooling a network](01-fooling-a-network.md): move every pixel a little, along the sign of the slope, and measure the accuracy under attack.
2. [PGD](02-pgd.md): take many small steps, bring the picture back into the ε-ball after each, and train a network on attacked pictures.
3. [Targets and norms](03-targets-and-norms.md): get a picture read as a chosen digit, measure a change in two ways, and push a picture's embedding away without any label.

Each lesson ends with exercises that you solve in the page.
