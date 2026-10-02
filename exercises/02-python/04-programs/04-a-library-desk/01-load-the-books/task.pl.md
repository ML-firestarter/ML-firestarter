---
description: Wczytaj książki biblioteki z pliku JSON i odrzuć dane w złym kształcie, z komunikatem, który mówi gdzie.
---

# Wczytaj książki

*Korzysta z lekcji [Moduły i biblioteka standardowa](../../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md) dla `json` oraz [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla zgłaszania błędów.*

To pierwsza część biblioteki, projektu z tej lekcji. Biblioteka trzyma książki w pliku JSON, `books.json`: lista z obiektem dla każdego tytułu, z tytułem, autorem, liczbą egzemplarzy, które biblioteka ma, i listą członków, którzy mają teraz egzemplarz.

```json
{"title": "Dune", "author": "Frank Herbert", "copies": 2, "borrowed": ["ann"]}
```

Pliki edytuje się ręcznie, więc program musi je sprawdzić, zanim im zaufa. Dokończ `parse_books(text)`, które zamienia tekst takiego pliku na listę książek albo zgłasza `ValueError`, którego komunikat mówi, co jest nie tak. `load_books(path)` jest napisane: czyta plik i wywołuje `parse_books`. Książki w komunikatach liczy się od 1, a dla każdej książki sprawdzenia idą w tej kolejności:

| Co jest nie tak                                           | Komunikat                             |
| --------------------------------------------------------- | ------------------------------------- |
| tekst nie jest JSON                                       | `not valid JSON`                      |
| JSON nie jest listą                                       | `expected a list of books`            |
| książka nie jest obiektem (słownikiem)                    | `book 1: expected an object`          |
| brakuje klucza, szukanego w kolejności `title`, `author`, `copies`, `borrowed` | `book 1: missing author` |
| tytuł nie jest tekstem albo jest pusty                    | `book 1: bad title`                   |
| autor nie jest tekstem                                    | `book 1: bad author`                  |
| `copies` nie jest liczbą całkowitą 0 lub więcej (`True` tu nie jest liczbą) | `book 1: bad copies` |
| `borrowed` nie jest listą tekstów                         | `book 1: bad borrowed`                |
| więcej członków ma egzemplarz, niż biblioteka posiada     | `book 1: more borrowed than copies`   |

Książka, która przejdzie, wraca taka, jaka była w pliku. Program pod funkcjami wczytuje `books.json` i wypisuje, ile ma książek.

> [!TIP]
> `json.loads(text)` zgłasza `json.JSONDecodeError`, który jest rodzajem `ValueError`, dla tekstu, który nie jest JSON. Złap go i zgłoś swój. `isinstance(value, int)` jest prawdziwe także dla `True`, więc najpierw sprawdź `bool`.
