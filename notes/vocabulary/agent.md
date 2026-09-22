---
description: A system where a language model works toward a goal in steps, choosing and using tools such as search, code or an API.
---

# Agent

A chatbot answers one message at a time. An agent is given a goal and works toward it in a loop: the model decides on an action, such as searching the web, running code or calling an API, a program carries it out, and the result goes back to the model, which decides what to do next. The loop ends when the model decides the goal is reached, or when it hits a limit on steps or cost.

The model picks a tool by writing a structured request, a *tool call*, that names the tool and its arguments; it never runs anything itself. What an agent can do depends on the tools it's given, so connecting it to email, files or payments makes it more useful and raises the stakes of a mistake. Errors also compound: a wrong result early on can derail every later step, which is why agents usually get limits and ask before risky actions. And every step adds to the conversation the model sees, so long tasks can fill its [context window](context-window.md).

In [reinforcement learning](rl.md), "agent" means any learner that acts in an environment. The two meanings meet, because agents built on language models are often trained with RL on multi-step tasks.

**Example:** asked "Which of our three biggest customers has an open support ticket?", an agent queries the sales database for the three biggest customers, searches the ticket system for each name, and then answers from what the tools returned.

**Related:** [RL](rl.md) · [Policy](policy.md) · [RAG](rag.md) · [Context window](context-window.md)
