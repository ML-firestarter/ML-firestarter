# Agent

## What makes an agent different from a chatbot?

- [ ] It runs on a bigger model
- [x] It works toward a goal in a loop, choosing actions and seeing their results
- [ ] It learns from every conversation while it's happening
- [ ] It answers without using a context window

A chatbot answers one message at a time. An agent decides on an action, such as a web search or an API call, a program carries it out, and the result goes back to the model, which decides what to do next.

## How does the model in an agent use a tool?

- [ ] It runs the tool's code inside the model
- [ ] It's retrained on the tool's documentation first
- [x] It writes a tool call that names the tool and its arguments, and a program runs it
- [ ] The user runs each tool and pastes the result back

The model never runs anything itself. It writes a structured request, and the program around it carries it out and returns the result.

## Why do agents usually get limits and ask before risky actions?

- [x] A wrong result early on can derail every later step
- [x] Tools such as email, files or payments raise the stakes of a mistake
- [ ] A model can only call one tool per task
- [ ] Limits make the model's answers more accurate

Errors compound from step to step, and the more an agent can do, the more a mistake can cost.

## An agent works on a long task. What happens to its context window?

- [ ] Nothing, because tool results aren't counted
- [ ] It grows to fit the task
- [x] It fills up, because every step adds to the conversation the model sees
- [ ] It's cleared after each tool call

Every action and every result is added to the conversation, so long tasks can fill the window.

## What does "agent" mean in reinforcement learning?

- [x] Any learner that acts in an environment
- [ ] Only a language model that uses tools
- [ ] The program that hands out the rewards
- [ ] A person who labels training data

In RL the agent is the learner, acting according to its policy. The two meanings meet, because agents built on language models are often trained with RL on multi-step tasks.
