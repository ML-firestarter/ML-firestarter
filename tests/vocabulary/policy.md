# Policy

## What is a policy in reinforcement learning?

- [ ] The rules of the environment
- [ ] The function that computes the reward
- [x] The strategy that chooses an action for what the agent observes
- [ ] A limit on how many actions the agent may take

A policy maps a state to an action, usually as probabilities over the possible actions, written $\pi(a \mid s)$.

## For a language model, what is an action?

- [x] Writing the next token
- [ ] Updating its weights
- [ ] Reading the prompt
- [ ] Choosing which reward model to use

The state is the prompt plus the text written so far, and each action is the next token.

## Why do RLHF papers call the model being trained "the policy"?

- [ ] It decides which prompts to train on
- [ ] It enforces the company's content policy
- [ ] It scores the responses of other models
- [x] Its next-token probabilities are exactly a policy

The model gives a probability to every possible next token given the text so far, which is what a policy does.

## What does reinforcement learning do to a policy?

- [ ] Copies the actions from labeled examples
- [x] Makes the actions that lead to more reward more likely
- [ ] Makes every action equally likely
- [ ] Removes every action that ever led to a low reward

Actions that lead to more reward become more likely. Copying labeled examples is supervised learning.

## What does a chess program's policy do?

- [ ] Gives the final score of a game
- [ ] Checks that the moves follow the rules
- [x] Looks at the board and gives each legal move a probability
- [ ] Tries every possible game to the end before each move

Moves that led to wins in training become more likely over time.
