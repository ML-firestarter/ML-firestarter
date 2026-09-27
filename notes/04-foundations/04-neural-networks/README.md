---
description: Connect neurons into a network that can draw more than an S, work out the slope for every weight with backpropagation, train the network, and prepare its inputs.
---

# Neural networks

A neural network is made of **neurons**, and each neuron works like a small logistic regression: it multiplies its inputs by weights, adds a bias, and puts the result through a function like the sigmoid. One neuron on its own can only draw an S. Connect a few, so that what some of them work out goes into the others, and together they can draw almost any shape. That's all a neural network is, whether it has three neurons or billions.

The name comes from the brain, whose nerve cells, also called neurons, pass signals to one another. The first artificial neurons were inspired by them, but a neuron in a network is just a formula, and the comparison doesn't go much further.

The four lessons build on [Logistic regression](../03-logistic-regression/), with the same taxi company and a question that a single S can't answer. First a network of three neurons, put together by hand, then **backpropagation**, which works out the slope of the loss for every weight in a network, however many layers it has, and then training, with two questions that logistic regression never had to ask: where to start, and when to stop. Last come the inputs: a new one, worked out from the length of the ride, that lets logistic regression draw a U after all, and **standardization**, which puts inputs of very different sizes on the same scale, so that gradient descent doesn't crawl.
