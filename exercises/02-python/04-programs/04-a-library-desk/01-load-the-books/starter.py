import json


def parse_books(text):
    return json.loads(text)


def load_books(path):
    with open(path) as file:
        return parse_books(file.read())


if __name__ == "__main__":
    books = load_books("books.json")
    print(len(books), "books")
    print(books[0]["title"])
