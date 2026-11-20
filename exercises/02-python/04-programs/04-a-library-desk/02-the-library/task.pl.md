---
description: Napisz klasę Library, która wypożycza i przyjmuje książki, odmawia własnymi błędami tego, czego nie może zrobić, i zapisuje książki do pliku.
---

# Biblioteka

*Korzysta z lekcji [Klasy](../../../../../notes/02-python/04-programs/01-classes.pl.md), z której przyda się klasa, oraz z lekcji [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przydadzą się błędy.*

Druga część wypożyczalni. `parse_books` i `load_books` z pierwszej części są już gotowe, podobnie jak `LibraryError`, nasz własny rodzaj błędu dla wszystkiego, czego biblioteka musi odmówić. `class Library` przechowuje listę książek, z którą ją utworzono, jako `self.books`. Dokończ jej metody:

- `find(title)` zwraca książkę, czyli słownik z pliku, o tytule `title`. Wielkość liter i spacje wokół tytułu nie mają znaczenia: `" EMMA "` znajduje `Emma`. Tytuł, którego nie ma w bibliotece, zgłasza `LibraryError("no such book: " + title)`, z tytułem w takiej postaci, w jakiej o niego zapytano.
- `available(title)` zwraca, ile egzemplarzy książki stoi na półce: jej `copies` minus liczba czytelników, którzy ją mają.
- `borrow(title, member)` dodaje `member` do listy `borrowed` książki i zwraca, ile egzemplarzy zostało. Zgłasza `LibraryError` z właściwym tytułem książki w komunikacie, gdy `member` już ma tę książkę (`ann already has Dune`) albo gdy nie ma wolnego egzemplarza (`no copies left: Dune`), sprawdzając w tej kolejności. Tytuł, którego nie ma, zgłasza błąd z `find`.
- `give_back(title, member)` usuwa `member` z listy. Gdy `member` nie ma na tej liście, zgłasza `LibraryError`: `ann doesn't have Dune`.
- `borrowed_by(member)` zwraca tytuły książek, które ma `member`, w kolejności alfabetycznej, albo `[]`.
- `save(path)` zapisuje książki do pliku jako JSON tak, żeby `load_books(path)` odczytało bibliotekę w obecnym stanie.

| Wywołanie na bibliotece z `books.json` | Zwraca                                         |
| -------------------------------------- | ---------------------------------------------- |
| `library.available("Dune")`            | `1`                                            |
| `library.borrow("dune", "bob")`        | `0`, a potem `library.available("Dune")` to 0  |
| `library.borrow("dune", "cy")` po tym  | zgłasza `LibraryError("no copies left: Dune")` |
| `library.borrowed_by("ann")`           | `["Dune", "Persuasion"]`                       |

Każdy błąd, którego oczekują testy, to `LibraryError`, a testy czytają jego komunikat. Program pod klasą wypożycza książkę i pokazuje, co ma czytelnik.

> [!TIP]
> Liczba egzemplarzy na półce to `book["copies"] - len(book["borrowed"])`, więc `borrow` i `give_back` zmieniają tylko listę. Znajdź książkę raz, przez `self.find(title)`, i korzystaj z tego, co zwróci. `json.dump(data, file, indent=2)` zapisuje JSON do otwartego pliku.
