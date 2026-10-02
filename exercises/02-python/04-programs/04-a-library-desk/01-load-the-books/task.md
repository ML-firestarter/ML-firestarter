---
description: Read a library's books from a JSON file, and refuse data that isn't in the right shape, with a message that says where.
---

# Load the books

*Draws on [Modules and the standard library](../../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.md) for `json`, and on [Exceptions](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for raising errors.*

This is the first part of the library desk, the lesson's project. The library keeps its books in a JSON file, `books.json`: a list with an object for each title, with the title, the author, how many copies the library owns, and the list of members who have a copy at the moment.

```json
{"title": "Dune", "author": "Frank Herbert", "copies": 2, "borrowed": ["ann"]}
```

Files are edited by hand, so the program has to check them before it trusts them. Finish `parse_books(text)`, which turns the text of such a file into the list of books, or raises a `ValueError` whose message says what's wrong. `load_books(path)` is written: it reads a file and calls `parse_books`. The books are counted from 1 in the messages, and the checks happen in this order for each book:

| What's wrong                                              | The message                           |
| --------------------------------------------------------- | ------------------------------------- |
| the text isn't JSON                                       | `not valid JSON`                      |
| the JSON isn't a list                                     | `expected a list of books`            |
| a book isn't an object (a dictionary)                     | `book 1: expected an object`          |
| a key is missing, looking for `title`, `author`, `copies` and `borrowed` in that order | `book 1: missing author` |
| the title isn't text, or is empty                         | `book 1: bad title`                   |
| the author isn't text                                     | `book 1: bad author`                  |
| `copies` isn't a whole number of 0 or more (`True` isn't a number here) | `book 1: bad copies`    |
| `borrowed` isn't a list of text                           | `book 1: bad borrowed`                |
| more members have a copy than the library owns            | `book 1: more borrowed than copies`   |

A book that passes returns as it was in the file. The program under the functions loads `books.json` and prints how many books it has.

> [!TIP]
> `json.loads(text)` raises a `json.JSONDecodeError`, which is a kind of `ValueError`, for text that isn't JSON. Catch it and raise yours. `isinstance(value, int)` is also true for `True`, so check for `bool` first.
