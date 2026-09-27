---
description: Predict whether a taxi order will be cancelled, measure how wrong the prediction is, and train the model with gradient descent.
---

# Logistic regression

Logistic regression answers yes-or-no questions: is this email spam, will this customer cancel their order, will it rain tomorrow. It's the simplest model that sorts examples into categories, and the neurons of a neural network are built on the same idea.

Its name comes from its two parts. The **logistic function**, more often called the sigmoid, squeezes any number into a probability between 0 and 1. **Regression**, because, like linear regression, the model predicts a number: the probability of a yes. A threshold then turns the probability into the answer, yes or no, and that makes the model a classifier.

The three lessons follow the same path as [Linear regression](../02-linear-regression/), with the same taxi company. First a rule that predicts the probability that a customer cancels their order, then a score that says how wrong the rule is, and last, training. The weight, the bias and gradient descent come back almost unchanged, so most of the new work is in two places: the function that turns a line into a probability, and a loss for probabilities.
