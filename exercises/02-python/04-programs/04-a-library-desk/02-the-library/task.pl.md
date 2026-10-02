---
description: Napisz klasę Library, która wypożycza książki i je przyjmuje, odmawia tego, czego nie może, własnymi błędami i zapisuje książki do pliku.
---

# Biblioteka

*Korzysta z lekcji [Klasy](../../../../../notes/02-python/04-programs/01-classes.pl.md) dla klasy oraz [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla błędów.*

Druga część biblioteki. `parse_books` i `load_books` z pierwszej części są napisane, razem z `LibraryError`, błędem naszego własnego rodzaju dla rzeczy, których biblioteka musi odmówić. `class Library` trzyma listę książek, z którą ją zrobiono, jako `self.books`. Dokończ jej metody:

- `find(title)` zwraca książkę, słownik z pliku, której tytuł to `title`. Wielkie litery i spacje wokół tytułu nie mają znaczenia: `" EMMA "` znajduje `Emma`. Tytuł, którego nie ma w bibliotece, zgłasza `LibraryError("no such book: " + title)`, z tytułem takim, jak o niego zapytano.
- `available(title)` zwraca, ile egzemplarzy książki jest na półce: jej `copies` minus członkowie, którzy ją mają.
- `borrow(title, member)` wkłada `member` na listę `borrowed` książki i zwraca, ile egzemplarzy zostało. Zgłasza `LibraryError`, z własnym tytułem książki w komunikacie, gdy `member` już ma książkę (`ann already has Dune`) albo gdy nie ma wolnego egzemplarza (`no copies left: Dune`), w tej kolejności. Tytuł, którego nie ma, zgłasza błąd z `find`.
- `give_back(title, member)` zdejmuje `member` z listy. Gdy jej nie ma, zgłasza `LibraryError`: `ann doesn't have Dune`.
- `borrowed_by(member)` zwraca tytuły książek, które ma `member`, w kolejności alfabetycznej, albo `[]`.
- `save(path)` zapisuje książki do pliku jako JSON, tak żeby `load_books(path)` odczytało bibliotekę taką, jaka jest teraz.

| Wywołanie, na bibliotece z `books.json`         | Zwraca                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| `library.available("Dune")`                     | `1`                                            |
| `library.borrow("dune", "bob")`                 | `0`, a potem `library.available("Dune")` to 0  |
| `library.borrow("dune", "cy")` po tym           | zgłasza `LibraryError("no copies left: Dune")` |
| `library.borrowed_by("ann")`                    | `["Dune", "Persuasion"]`                       |

Każdy błąd, którego szukają testy, to `LibraryError`, a testy czytają jego komunikat. Program pod klasą wypożycza książkę i pokazuje, co ma członek.

> [!TIP]
> Egzemplarze książki na półce to `book["copies"] - len(book["borrowed"])`, więc `borrow` i `give_back` zmieniają tylko listę. Znajdź książkę raz, przez `self.find(title)`, i używaj tego, co da. `json.dump(data, file, indent=2)` zapisuje JSON do otwartego pliku.
