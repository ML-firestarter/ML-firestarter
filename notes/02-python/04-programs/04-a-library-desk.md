---
description: Build a library desk from three parts, a data file that's checked, a class with errors of its own, and a command loop, and see how the lessons fit together.
---

# Project: a library desk

A small library lends books to its members. It knows which books it owns and how many copies of each, and who has a copy at the moment, and its librarian types things like `borrow Dune bob` at a desk and expects an answer. In this lesson you'll build that program, in three parts, and each part uses what a lesson of the track taught: [files and JSON](02-modules-and-the-standard-library.md), [classes](01-classes.md), [errors](../03-errors-and-testing/01-exceptions.md) and [tests](../03-errors-and-testing/02-testing-your-code.md).

A program of this size is too big to write in one go, so the lesson is about **how to build it**. You'll need:

- a way to split a program into **layers**: data, rules and the screen,
- **errors of your own**, for the things the program has to refuse,
- the habit of keeping **input and output at the edge**, so that the rest can be tested,
- **small steps**, with each layer checked before the next one is built on it.

## Three layers

Look at what the program does, and sort it into layers:

1. **Data.** The books live in a JSON file, which people edit by hand, so the program must check what it reads before it trusts it.
2. **Rules.** A book has copies, a member can't borrow the same book twice, and a book with no copies left can't be borrowed. These are rules about the library, and they don't care whether a person at a keyboard or a web page asks.
3. **The screen.** Reading a line the librarian typed, working out which command it is, and printing an answer.

Each layer talks only to the one under it: the screen calls the rules, and the rules work on data that has been checked. A change in one place stays there. If the library later got a web page instead of a keyboard, only the third layer would be written again, and the data and the rules would stay as they are. Each layer is one exercise.

## Layer 1: data that's been checked

The file has a list of books, each an object with four keys:

```python run
import json

text = """
[
  {"title": "Dune", "author": "Frank Herbert", "copies": 2, "borrowed": ["ann"]},
  {"title": "Emma", "author": "Jane Austen", "copies": 1, "borrowed": []}
]
"""

books = json.loads(text)
print(len(books), books[0]["title"], books[0]["borrowed"])
print(json.dumps(books[1]))
```

`json.loads()` gives Python lists and dictionaries, and `json.dumps()` writes them back, which is how the library will save itself. `loads` only checks that the text is JSON, though, and not that it's a library: `[1, 2]` and `{"title": 5}` load fine. The first exercise is a function that goes through everything the program counts on, key by key, and raises a `ValueError` that says where the first problem is, like `book 3: missing author`. It goes in this order, from the whole file down to each book, so the messages are about the most general problem first.

A function that stops bad data at the door means that nothing after it has to ask whether a book has a `copies`.

## Errors of your own

A library has its own kinds of failure: there's no such book, or no copy left. They aren't a `ValueError` or a `KeyError`, and a program that reads `except ValueError` wouldn't know they came from the library. An error of your own is a class that comes from `Exception`, and it needs nothing in its body:

```python run
class LibraryError(Exception):
    pass


def borrow(copies_left):
    if copies_left == 0:
        raise LibraryError("no copies left")
    return copies_left - 1


try:
    print(borrow(1))
    print(borrow(0))
except LibraryError as error:
    print("The library says:", error)
```

`LibraryError` is used the way `ValueError` is, with `raise` and `except`, and the message is whatever it's raised with. Code that catches `LibraryError` catches the library's refusals and nothing else, and a `TypeError` from a real mistake in the program still stops it with a traceback. The error can also be caught as `Exception`, because it comes from it, which `isinstance(error, Exception)` shows.

## Layer 2: the rules

The library is a class that keeps the books, and its methods are the rules. Each one looks the book up, checks what it needs to, changes the data and reports what happened:

```python run
class LibraryError(Exception):
    pass


class Library:
    def __init__(self, books):
        self.books = books

    def find(self, title):
        for book in self.books:
            if book["title"].lower() == title.strip().lower():
                return book
        raise LibraryError(f"no such book: {title}")

    def available(self, title):
        book = self.find(title)
        return book["copies"] - len(book["borrowed"])

    def borrow(self, title, member):
        book = self.find(title)
        if self.available(title) == 0:
            raise LibraryError(f"no copies left: {book['title']}")
        book["borrowed"].append(member)
        return self.available(title)


library = Library([{"title": "Dune", "author": "Frank Herbert", "copies": 1, "borrowed": []}])
print(library.borrow("dune", "bob"))
try:
    library.borrow("Dune", "cy")
except LibraryError as error:
    print(error)
```

`find` is the one place that knows how to look a book up, ignoring capitals and stray spaces, and every other method calls it, so a change to how books are found is made once. The errors have the book's own title, `Dune`, and not the `dune` the librarian typed. The class never prints and never reads the keyboard: it returns an answer or raises an error. That is what makes it easy to test, the way the second exercise's checks do, with a library built in memory and a few calls.

## Layer 3: the screen

The last layer reads what's typed, finds out what it means and prints the result. Split it in two: a function that turns a line into an answer, and a loop that reads and prints. The function returns a text, or raises an error, and doesn't print:

```python run
class DeskError(Exception):
    pass


def run_command(total, line):
    words = line.split()
    if len(words) == 0:
        return total, None
    if words[0] == "add" and len(words) == 2:
        return total + int(words[1]), f"total is now {total + int(words[1])}"
    if words[0] == "total":
        return total, f"total is {total}"
    raise DeskError(f"unknown command: {words[0]}")


total = 0
while True:
    try:
        line = input("> ")
    except EOFError:
        break
    if line == "quit":
        print("Goodbye")
        break
    try:
        total, answer = run_command(total, line)
    except (DeskError, ValueError) as error:
        print(f"Error: {error}")
    else:
        if answer is not None:
            print(answer)
```

This little desk adds numbers. Type commands in the **Input** box, one on each line, like `add 5`, `add x`, `total` and `quit`, and press **Run**. The loop is as small as it can be. It reads a line, and `quit` ends it. Otherwise it calls `run_command` inside a `try`, and an error is printed as `Error: ...` and the loop goes on, which is why a typo at the desk doesn't end the program. `EOFError` is what `input()` raises when the typed lines run out.

The library's desk is the same shape, with more commands: `list`, `borrow`, `return` and `who`. A title can have spaces, so the member is the last word and the title is what's between the command and the member.

## Small steps

You don't have to write all of this and then run it. In each exercise, **Check** tells you which calls work, and you build up:

1. Write `parse_books` until a valid file loads, and then add the checks one at a time. Each message in the table is a line or two.
2. Write `find` first, because all the others use it, and then `available`, `borrow`, and so on.
3. Make `list` work, then `borrow`, and the errors last.

When something is wrong, the checks say what call they made, what they expected and what they got, and that's usually enough to find the line. A traceback, which the [Exceptions lesson](../03-errors-and-testing/01-exceptions.md) taught you to read, says where.

## Your turn

The project is in three exercises, each building on the last, and each starts with the code of the one before written, so that you can work on a layer at a time:

- In [Load the books](../../../exercises/02-python/04-programs/04-a-library-desk/01-load-the-books/task.md), you'll check the data file, with a message for each kind of mistake.
- In [The library](../../../exercises/02-python/04-programs/04-a-library-desk/02-the-library/task.md), you'll write the class: finding, lending and taking back books, errors of its own, and saving.
- In [The desk](../../../exercises/02-python/04-programs/04-a-library-desk/03-the-desk/task.md), you'll write the loop that reads the librarian's commands and answers them, and reports errors without stopping.
