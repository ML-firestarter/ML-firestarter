---
description: Learning rules from examples instead of writing them by hand.
---

# What is machine learning?

In ordinary programming you write the rules: the code decides what output each input gets. In machine learning you give the computer **examples** of inputs with the right outputs, and it works out the rules itself.

$$
\text{examples} + \text{answers} \;\longrightarrow\; \text{learning algorithm} \;\longrightarrow\; \text{model}
$$

A spam filter is the classic case. Hand-written rules ("block emails that say *free money*") break as soon as spammers change their wording. A learned filter studies thousands of emails labelled *spam* or *not spam* and picks up the patterns on its own, including ones nobody would have thought to write down.

## Three kinds of learning

| Kind          | You provide                     | It learns to                      | Example                        |
| ------------- | ------------------------------- | --------------------------------- | ------------------------------ |
| Supervised    | inputs **with** the answers     | predict the answer for new inputs | house price from floor area    |
| Unsupervised  | inputs **without** answers      | find structure in the data        | group customers by behavior    |
| Reinforcement | an environment and a reward     | choose actions that earn reward   | play a game                    |

Supervised learning splits further by what it predicts:

- **Regression** predicts a number, such as a price or a temperature.
- **Classification** predicts a category, such as spam or not spam, or which digit is in an image.

## Vocabulary

- **Example** (or sample): one row of data, like one house.
- **Feature**: one input measurement, like floor area. The features of one example form a vector $x$.
- **Label** (or target): the answer to predict, $y$.
- **Model**: a function that turns features into a prediction, $\hat{y} = f(x)$.
- **Parameters**: the numbers inside the model that learning adjusts.
- **Loss**: how far the predictions are from the labels. Training means making it small.

## Training, validation and test data

A model that has memorized its training data can look perfect and still fail on new data. That's called **overfitting**. To catch it, split the data three ways:

1. The **training set** is used to fit the parameters.
2. The **validation set** is used to compare models and tune settings such as the learning rate.
3. The **test set** is used once, at the end, to estimate how the model will do on data it has never seen.

> [!IMPORTANT]
> Once the test set has influenced any decision, it no longer gives a fair estimate.

## Check yourself

<details>
<summary>Is predicting tomorrow's temperature regression or classification?</summary>

Regression, because the answer is a number. Predicting "rain or no rain" would be classification.

</details>

<details>
<summary>Why not measure the model on its training data?</summary>

The model has already seen those examples, so it can score well just by memorizing them. Only data it hasn't seen tells you whether it generalizes.

</details>
