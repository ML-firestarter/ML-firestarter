# RL

## What's the key difference between supervised learning and reinforcement learning?

- [x] In RL nobody provides the right answer; the learner only gets a reward that says how well things went
- [ ] RL doesn't use any data
- [ ] RL only works for games
- [ ] Supervised learning needs a reward model

In supervised learning every example comes with the right answer. In RL the learner has to find good actions by trial and error.

## The reward can come long after the actions that caused it. What does the learner have to do?

- [ ] Ignore rewards that come late
- [ ] Wait until training ends before learning anything
- [ ] Ask for the right answer after each action
- [x] Work out which actions deserve the credit

That's a big part of what makes RL hard.

## An agent learns to play a video game. What's its reward?

- [ ] The screen it sees
- [ ] The buttons it presses
- [x] The change in score
- [ ] The game itself

The screen is the state, the buttons are actions and the game is the environment.

## Where does the reward come from when RL is used on language models?

- [x] From a reward model, in RLHF
- [ ] From the next token in the training text
- [x] From checking the answer, in RLVR
- [ ] From an ideal response to imitate

Predicting the next token of existing text is pretraining, and imitating ideal responses is SFT.

## What's the goal of reinforcement learning?

- [ ] A model that copies expert actions exactly
- [ ] A reward model that agrees with people
- [x] A policy that collects as much reward as possible
- [ ] An environment that gives every action the same reward

PPO and GRPO are two widely used algorithms for getting there with language models.
