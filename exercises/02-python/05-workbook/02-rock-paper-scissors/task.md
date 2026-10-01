---
description: Referee a game of rock, paper, scissors, one round at a time and over a whole match.
input: "rock\nscissors"
---

# Rock, paper, scissors

*Draws on [Conditions and functions](../../../../notes/02-python/01-basics/01-conditions-and-functions.md), [Loops and dictionaries](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.md) and, for `raise`, [Lists of lists](../../../../notes/02-python/01-basics/05-lists-of-lists.md).*

In rock, paper, scissors, two players pick a move at the same time: rock beats scissors, scissors beats paper, and paper beats rock. Two equal moves make a draw. The editor has a dictionary, `BEATS`, that says which move each one beats: `BEATS["rock"]` is `"scissors"`.

Write two functions:

- `round_winner(first, second)` takes the two players' moves, and returns `"first"` when the first player wins the round, `"second"` when the second one does, and `"draw"` when it's a draw. Capitals make no difference: `Rock` is `rock`. A move that isn't rock, paper or scissors raises a `ValueError`.
- `score(first_moves, second_moves)` takes the moves of a whole match, a list for each player, and returns a dictionary with how many rounds the first player won, how many the second player won and how many were draws, under the keys `"first"`, `"second"` and `"draw"`. It always has all three keys. When the lists have different lengths, it raises a `ValueError`.

| Call                                              | Returns                                |
| ------------------------------------------------- | -------------------------------------- |
| `round_winner("rock", "scissors")`                | `'first'`                              |
| `round_winner("rock", "paper")`                   | `'second'`                             |
| `round_winner("Paper", "paper")`                  | `'draw'`                               |
| `round_winner("rock", "lizard")`                  | raises `ValueError`                    |
| `score(["rock", "paper"], ["scissors", "paper"])` | `{'first': 1, 'second': 0, 'draw': 1}` |

The program under the functions reads the two players' moves from the **Input** box, a line each, and prints `Player 1 wins`, `Player 2 wins` or `Draw`. With `rock` and `scissors` in the box, it prints:

```text
rock
scissors
Player 1 wins
```
