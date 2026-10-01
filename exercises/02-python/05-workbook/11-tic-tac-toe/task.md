---
description: Play a game of tic-tac-toe from a file of moves, and say how it ended.
---

# Tic-tac-toe

*Draws on [Lists of lists](../../../../notes/02-python/01-basics/05-lists-of-lists.md), for lists inside lists, slices and `raise`, [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md), for reading a file and `split()`, and [Ranges and lists](../../../../notes/02-python/01-basics/03-ranges-and-lists.md), for returning from a loop.*

A tic-tac-toe board is a list of three rows, and each row is a list of three cells: `"X"`, `"O"`, or `"."` for a cell that's empty. Rows and columns count from 0. The editor has `new_board()`, which returns an empty board. Write four functions:

- `place(board, row, col, mark)` returns a new board with `mark` in the cell at `row` and `col`, and leaves the board it was given as it was. It raises a `ValueError` when the cell isn't on the board, because a number is too big or negative, when the cell is taken, and when `mark` isn't `"X"` or `"O"`, even if it's a small `x`.
- `winner(board)` returns `"X"` or `"O"` when that mark fills a row, a column or one of the two diagonals, and `None` when nobody has won. A line of empty cells doesn't win.
- `result(board)` returns `"X wins"` or `"O wins"` when there's a winner, `"Draw"` when the board is full and nobody has won, and `"Game not finished"` in every other case.
- `play(path)` reads a game from the file at `path`, with a move on each line, like `X 1 1` for a mark, its row and its column, and returns the board after the moves. It stops as soon as somebody wins, and the moves after that are ignored. When `place` doesn't allow a move, its `ValueError` comes out of `play` too.

| Call                                                          | Returns                                               |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| `place(new_board(), 1, 1, "X")`                               | `[['.', '.', '.'], ['.', 'X', '.'], ['.', '.', '.']]` |
| `place(new_board(), 3, 0, "X")`                               | raises `ValueError`                                   |
| `winner([['X', 'X', 'X'], ['O', 'O', '.'], ['.', '.', '.']])` | `'X'`                                                 |
| `winner(new_board())`                                         | `None`                                                |
| `result(new_board())`                                         | `'Game not finished'`                                 |

The program under the functions plays the game in `game.txt`, prints the board with a space between the cells, and then the result. Once your functions work, it prints:

```text
O . X
O X .
O . X
O wins
```

The checks play a few more games from other files, so `play` has to work for any file, not just `game.txt`.

This is one of the hardest tasks in the workbook, so here's one way to go about it:

1. To find a winner, collect the eight lines of the board as lists of three cells: the three rows, the three columns and the two diagonals. A line wins when its first cell isn't `"."` and the other two cells are the same as the first one.
2. To copy a board without sharing its rows with the old one, copy each row: `[line[:] for line in board]`. Put the mark in the copy.
3. In `play`, make a board with `new_board()`, then go through the lines of the file. Put each move on the board with `place`, and `return` the board as soon as `winner` finds a winner. The board after the last line is the answer if nobody has.
