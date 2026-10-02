---
description: Write a Library class that lends books and takes them back, refuses what it can't do with errors of its own, and saves its books to a file.
---

# The library

*Draws on [Classes](../../../../../notes/02-python/04-programs/01-classes.md) for the class, and on [Exceptions](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for errors.*

The second part of the library desk. `parse_books` and `load_books` from the first part are written, with `LibraryError`, an error of our own for the things a library has to refuse. `class Library` keeps the list of books it was made with, as `self.books`. Finish its methods:

- `find(title)` returns the book, the dictionary from the file, whose title is `title`. Capital letters and spaces around the title don't matter: `" EMMA "` finds `Emma`. A title that isn't in the library raises `LibraryError("no such book: " + title)`, with the title as it was asked for.
- `available(title)` returns how many copies of the book are on the shelf: its `copies` minus the members who have it.
- `borrow(title, member)` puts `member` in the book's `borrowed` list and returns how many copies are left. It raises a `LibraryError`, with the book's own title in the message, when `member` already has the book (`ann already has Dune`), or when no copy is left (`no copies left: Dune`), in that order. A title that isn't there raises the error of `find`.
- `give_back(title, member)` takes `member` out of the list. When they don't have it, it raises `LibraryError`: `ann doesn't have Dune`.
- `borrowed_by(member)` returns the titles of the books `member` has, in alphabetical order, or `[]`.
- `save(path)` writes the books to a file as JSON, so that `load_books(path)` reads back the library as it is now.

| Call, on the library of `books.json`            | Returns                                        |
| ----------------------------------------------- | ---------------------------------------------- |
| `library.available("Dune")`                     | `1`                                            |
| `library.borrow("dune", "bob")`                 | `0`, and then `library.available("Dune")` is 0 |
| `library.borrow("dune", "cy")` after that       | raises `LibraryError("no copies left: Dune")`  |
| `library.borrowed_by("ann")`                    | `["Dune", "Persuasion"]`                       |

Every error the checks look for is a `LibraryError`, and the checks read its message. The program under the class borrows a book and shows what a member has.

> [!TIP]
> A book's copies on the shelf are `book["copies"] - len(book["borrowed"])`, so `borrow` and `give_back` only change the list. Look the book up once, with `self.find(title)`, and use what it gives. `json.dump(data, file, indent=2)` writes JSON into an open file.
