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


if __name__ == "__main__":
    books = load_books("books.json")
    print(len(books), "books")
    print(books[0]["title"])
