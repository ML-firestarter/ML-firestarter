import json


def parse_books(text):
    try:
        books = json.loads(text)
    except json.JSONDecodeError:
        raise ValueError("not valid JSON")
    if not isinstance(books, list):
        raise ValueError("expected a list of books")
    for number, book in enumerate(books, start=1):
        if not isinstance(book, dict):
            raise ValueError(f"book {number}: expected an object")
        for key in ("title", "author", "copies", "borrowed"):
            if key not in book:
                raise ValueError(f"book {number}: missing {key}")
        if not isinstance(book["title"], str) or book["title"].strip() == "":
            raise ValueError(f"book {number}: bad title")
        if not isinstance(book["author"], str):
            raise ValueError(f"book {number}: bad author")
        copies = book["copies"]
        if not isinstance(copies, int) or isinstance(copies, bool) or copies < 0:
            raise ValueError(f"book {number}: bad copies")
        borrowed = book["borrowed"]
        if not isinstance(borrowed, list) or not all(isinstance(name, str) for name in borrowed):
            raise ValueError(f"book {number}: bad borrowed")
        if len(borrowed) > copies:
            raise ValueError(f"book {number}: more borrowed than copies")
    return books


def load_books(path):
    with open(path) as file:
        return parse_books(file.read())


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
        if member in book["borrowed"]:
            raise LibraryError(f"{member} already has {book['title']}")
        if self.available(title) == 0:
            raise LibraryError(f"no copies left: {book['title']}")
        book["borrowed"].append(member)
        return self.available(title)

    def give_back(self, title, member):
        book = self.find(title)
        if member not in book["borrowed"]:
            raise LibraryError(f"{member} doesn't have {book['title']}")
        book["borrowed"].remove(member)

    def borrowed_by(self, member):
        return sorted(book["title"] for book in self.books if member in book["borrowed"])

    def save(self, path):
        with open(path, "w") as file:
            json.dump(self.books, file, indent=2)


if __name__ == "__main__":
    library = Library(load_books("books.json"))
    print(library.borrow("dune", "bob"))
    print(library.borrowed_by("ann"))
