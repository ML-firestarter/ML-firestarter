---
description: Tensors and automatic gradients with PyTorch, the library most neural networks are written in, on the taxi company's receipts, with code that runs in the page.
---

# PyTorch

PyTorch is the library that most of today's neural networks are written in, from the small ones of these lessons to the language models. What the [neural network chapter](../04-foundations/04-neural-networks/) did with lists and loops, PyTorch does on whole tables of numbers at once. It works out the slopes for you, and it runs on a graphics card when there is one.

There's nothing to install. The code in these lessons runs in your browser, with a small PyTorch written for this site that prints what the real one prints, as [PyTorch in the page](../01-start-here/01-how-this-works.md#pytorch-in-the-page) explains. The same code runs unchanged on your computer, after `pip install torch`.

The chapter builds on [Python](../02-python/) and on [Foundations](../04-foundations/): you should be comfortable with functions, lists and loops, and know what a loss and a step of gradient descent are. The lessons keep the taxi company and its receipts.

## What you'll learn

1. [Tensors](01-tensors.md): work out a whole day's fares at once, and learn about shapes, types, views and broadcasting.
2. [Autograd](02-autograd.md): let PyTorch work out the slopes, and train the fare line with them.

Each lesson ends with exercises that you solve in the page.
