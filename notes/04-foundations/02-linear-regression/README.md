---
description: Predict a taxi fare from the length of the ride, measure how wrong the prediction is, and let the model find its own numbers.
---

# Linear regression

Linear regression predicts a number from other numbers: a flat's price from its floor area, a day's ice cream sales from the temperature, a taxi fare from the length of the ride. It's the simplest model that learns, and the ideas you'll meet on the way, a loss, a gradient and a learning rate, come back in every [neural network](../04-neural-networks/).

The three lessons build it one piece at a time, all with the same example: taxi fares. First a rule that predicts a fare, then a score that says how wrong the rule is, and last, training, where the rule finds its own numbers. Every formula comes after the arithmetic it sums up, so you'll have worked out each one by hand before you see it in symbols, and the code is plain Python until the very end.
