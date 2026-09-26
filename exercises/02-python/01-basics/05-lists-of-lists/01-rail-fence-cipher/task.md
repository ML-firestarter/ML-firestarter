---
description: Hide a message in a zigzag over a few rails, then read it off one rail at a time.
---

# Rail fence cipher

Write `rail_fence(text, rails)`, which encrypts `text` with the rail fence cipher on `rails` rails, as in the lesson:

1. With fewer than 1 rail, there's nothing to write the letters on, so it raises a `ValueError`.
2. It leaves out the spaces.
3. It writes the letters in a zigzag. The first letter goes on the top rail, and each next one on the rail below, down to the bottom rail. From there the letters go back up one rail at a time to the top one, and then down again.
4. It returns the letters of the top rail, followed by those of the rail below it, and so on down to the bottom rail.

| Call                                | Returns             |
| ----------------------------------- | ------------------- |
| `rail_fence("Podstawy pythona", 3)` | `'Ptpoosayyhndwta'` |
| `rail_fence("abcdef", 2)`           | `'acebdf'`          |
| `rail_fence("abc", 1)`              | `'abc'`             |
| `rail_fence("abc", 0)`              | raises `ValueError` |

On a single rail, every letter stays on the top rail, so the text comes back without its spaces. Make sure your zigzag doesn't step off the fence then.
