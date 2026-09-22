# What is machine learning?

## What does machine learning do differently from ordinary programming?

- [ ] You write more detailed rules, so the program makes fewer mistakes
- [x] You give the computer examples with the right outputs, and it works out the rules itself
- [ ] The computer writes the examples, and you check its rules
- [ ] It needs no data, because the rules are built into the algorithm

In ordinary programming you write the rules. In machine learning a learning algorithm turns examples and their answers into a model. That's why a learned spam filter keeps up when spammers change their wording, while hand-written rules break.

## You group customers by how they behave, without any labels. What kind of learning is that?

- [ ] Supervised learning
- [ ] Reinforcement learning
- [x] Unsupervised learning
- [ ] Classification

Unsupervised learning gets inputs without answers and finds structure in them. Supervised learning needs the answers, and reinforcement learning needs an environment and a reward.

## Which of these are classification?

- [x] Is this email spam or not?
- [ ] What will a house sell for, given its floor area?
- [x] Which digit is in this image?
- [ ] What will the temperature be tomorrow?

Classification predicts a category. Regression predicts a number, such as a price or a temperature.

## In a dataset of houses, what is the floor area?

- [x] A feature
- [ ] A label
- [ ] A parameter
- [ ] The loss

A feature is one input measurement. The price you want to predict would be the label, and parameters are the numbers inside the model that learning adjusts.

## A model scores almost perfectly on its training data but badly on new data. What's that called?

- [ ] Underfitting
- [ ] Data leakage
- [ ] Generalization
- [x] Overfitting

The model has memorized its training data instead of learning patterns that carry over to new data. Holding out data the model never trains on is how you catch it.

## What is the validation set for?

- [ ] Fitting the model's parameters
- [x] Comparing models and tuning settings such as the learning rate
- [ ] Estimating once, at the end, how the model will do on unseen data
- [ ] Replacing the training set once the model has memorized it

The training set fits the parameters, the validation set compares models and tunes settings, and the test set gives one final estimate at the end.

## You check the test set, don't like the score, change the learning rate and check again. What's the problem?

- [x] The test set has influenced a decision, so it no longer gives a fair estimate
- [ ] Nothing, as long as the training set stays the same
- [ ] The learning rate can only be tuned on the training set
- [ ] The model has to be trained from scratch before each check

Once the test set has influenced any decision, it no longer gives a fair estimate. Tune on the validation set, and keep the test set for the very end.
