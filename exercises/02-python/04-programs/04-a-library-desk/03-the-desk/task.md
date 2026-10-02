---
description: Write the desk, a program that reads commands such as borrow and return from the keyboard and answers them, and reports errors without stopping.
---

# The desk

*Draws on [Exceptions](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for handling errors, on [Conditions and functions](../../../../../notes/02-python/01-basics/01-conditions-and-functions.md) for `input()` and decisions, and on [Classes](../../../../../notes/02-python/04-programs/01-classes.md) for the library.*

The last part of the library desk: the program a librarian types commands into. The code has the whole `Library`, and a start of `desk(library)`, which asks for a command with the prompt `> ` and stops at `quit`, printing `Goodbye`. The program under it loads `books.json` and calls `desk`. Finish `desk` so that it answers these commands, typed in any mix of capitals. Each answer is a line, or several, printed under the command:

| Command                  | What it prints                                                                      |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `list`                   | a line for each book in alphabetical order of titles: `Dune (1/2)`, the copies on the shelf out of the copies owned |
| `borrow TITLE MEMBER`    | `bob borrowed Dune (0 left)`, with the book's own title and the copies left          |
| `return TITLE MEMBER`    | `ann returned Dune`                                                                 |
| `who MEMBER`             | the titles the member has, alphabetically, separated by commas, or `nothing`        |
| `quit`                   | `Goodbye`, and the program ends                                                     |

The title in `borrow` and `return` can have spaces, as in `borrow pride and prejudice cy`: the member is the **last** word, and the title is the words between. These don't stop the program, and each prints one line:

- a command that isn't one of these: `Error: unknown command: fly`
- `borrow` or `return` with fewer than three words: `Error: usage: borrow TITLE MEMBER` (with `return` for `return`), and `who` without exactly one name after it: `Error: usage: who MEMBER`
- anything the library refuses: `Error: ` and the `LibraryError`'s message, like `Error: no copies left: Dune`

A line with nothing on it is ignored, and prints nothing. If the input runs out, the program ends quietly.

```text
> borrow dune bob
bob borrowed Dune (0 left)
> borrow dune cy
Error: no copies left: Dune
> quit
Goodbye
```

The checks type commands into your program and compare everything it prints, prompts included, with what it should.

> [!TIP]
> Keep the work out of the loop: a function `run_command(library, line)` that returns what to print, or raises `LibraryError`, is easy to read, and the loop only reads, calls it inside a `try`, and prints. `line.split()` gives the words, and `words[-1]` the last.
