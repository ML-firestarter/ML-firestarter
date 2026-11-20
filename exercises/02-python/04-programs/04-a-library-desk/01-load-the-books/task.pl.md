---
description: Wczytaj książki biblioteki z pliku JSON i odrzuć dane o złej strukturze, z komunikatem, który mówi, gdzie jest problem.
---

# Wczytaj książki

*Korzysta z lekcji [Moduły i biblioteka standardowa](../../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md), z której przyda się `json`, oraz z lekcji [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przyda się zgłaszanie błędów.*

To pierwsza część wypożyczalni, projektu z tej lekcji. Biblioteka przechowuje książki w pliku JSON, `books.json`. Jest to lista z obiektem dla każdego tytułu, a w obiekcie są tytuł, autor, liczba egzemplarzy, które ma biblioteka, i lista czytelników, którzy mają teraz egzemplarz.

```json
{"title": "Dune", "author": "Frank Herbert", "copies": 2, "borrowed": ["ann"]}
```

Pliki są edytowane ręcznie, więc program musi je sprawdzić, zanim im zaufa. Dokończ funkcję `parse_books(text)`, która zamienia tekst takiego pliku na listę książek albo zgłasza `ValueError` z komunikatem, który mówi, co jest nie tak. `load_books(path)` jest już gotowe: czyta plik i wywołuje `parse_books`. W komunikatach książki są numerowane od 1, a kolejność sprawdzeń jest taka:

| Co jest nie tak                                                                              | Komunikat                           |
| -------------------------------------------------------------------------------------------- | ----------------------------------- |
| tekst nie jest JSON-em                                                                       | `not valid JSON`                    |
| JSON nie jest listą                                                                          | `expected a list of books`          |
| książka nie jest obiektem (słownikiem)                                                       | `book 1: expected an object`        |
| brakuje klucza (klucze sprawdza się w kolejności `title`, `author`, `copies`, `borrowed`)    | `book 1: missing author`            |
| tytuł nie jest tekstem albo jest pusty                                                       | `book 1: bad title`                 |
| autor nie jest tekstem                                                                       | `book 1: bad author`                |
| `copies` nie jest liczbą całkowitą równą 0 lub większą (`True` nie liczy się tu jako liczba) | `book 1: bad copies`                |
| `borrowed` nie jest listą tekstów                                                            | `book 1: bad borrowed`              |
| więcej czytelników ma egzemplarz, niż biblioteka ma egzemplarzy                              | `book 1: more borrowed than copies` |

Książka, która przejdzie wszystkie sprawdzenia, zostaje zwrócona w takiej postaci, w jakiej była w pliku. Program pod funkcjami wczytuje `books.json` i wypisuje, ile jest w nim książek.

> [!TIP]
> Dla tekstu, który nie jest JSON-em, `json.loads(text)` zgłasza `json.JSONDecodeError`, czyli rodzaj `ValueError`. Złap go i zgłoś swój. `isinstance(value, int)` jest prawdziwe także dla `True`, więc najpierw sprawdź `bool`.
