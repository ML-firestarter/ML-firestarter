---
description: Wyciągnij z tekstu śladu stosu rodzaj błędu, jego komunikat oraz funkcję i linijkę, w której wystąpił.
---

# Przeczytaj ślad stosu

*Korzysta z lekcji [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przyda się czytanie śladu stosu, oraz z lekcji [Moduły i biblioteka standardowa](../../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md), z której przyda się `re`.*

Gdy program zatrzymuje się z błędem, Python wypisuje **ślad stosu** (ang. traceback): wywołania, które doprowadziły do błędu, od najbardziej zewnętrznego do najgłębszego, a na końcu to, co poszło nie tak. Ostatnia linijka `File` wskazuje miejsce, w którym wystąpił błąd, a ostatnia linijka całego śladu to sam błąd. Dokończ funkcję `where_it_failed(text)`, która dostaje tekst śladu stosu i zwraca słownik, w którym:

- `"error"` to rodzaj błędu, na przykład `ZeroDivisionError`,
- `"message"` to tekst po dwukropku w ostatniej linijce albo `""`, gdy błąd nie ma komunikatu,
- `"function"` to nazwa funkcji z ostatniej linijki `File`, czyli `<module>`, gdy błąd wystąpił poza wszystkimi funkcjami,
- `"line"` to numer linijki z ostatniej linijki `File`, jako liczba całkowita.

W kodzie są już `FRAME`, wyrażenie regularne dla linijki `File` z grupami `file`, `line` i `function`, oraz ślady stosu z tabeli, zapisane jako `AVERAGE`, `MISSING_KEY`, `BAD_PRICE`, `BARE_RAISE` i `NO_FILE`.

| Wywołanie                     | Zwraca                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `where_it_failed(AVERAGE)`    | `{"error": "ZeroDivisionError", "message": "division by zero", "function": "average", "line": 7}` |
| `where_it_failed(BARE_RAISE)` | `{"error": "ValueError", "message": "", "function": "<module>", "line": 3}`                       |

Wypisz jeden z nich, na przykład przez `print(AVERAGE)`, żeby zobaczyć, jak wygląda. Tekst może być otoczony pustymi linijkami albo znakami nowej linii, które usuwa `strip()`, a sam komunikat może zawierać dwukropek, więc ostatnią linijkę dziel tylko na **pierwszym** `": "`.

> [!TIP]
> `text.partition(": ")` dzieli tekst na pierwszym dwukropku i daje trzy części, a gdy dwukropka nie ma, dwie ostatnie są puste. `FRAME.search(line)` daje `None` dla linijki, która nie jest linijką `File`.
