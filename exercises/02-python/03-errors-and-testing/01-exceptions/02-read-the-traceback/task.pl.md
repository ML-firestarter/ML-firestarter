---
description: Wyciągnij z tekstu śladu stosu rodzaj błędu, jego komunikat oraz funkcję i linię, w której się zdarzył.
---

# Przeczytaj ślad stosu

*Korzysta z lekcji [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla czytania śladu stosu oraz [Moduły i biblioteka standardowa](../../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md) dla `re`.*

Gdy program zatrzymuje się z błędem, Python wypisuje **ślad stosu** (ang. traceback): wywołania, które doprowadziły do błędu, od zewnętrznego do najgłębszego, a potem to, co poszło nie tak. Ostatnia linia `File` to miejsce, gdzie się zdarzyło, a ostatnia linia w ogóle to błąd. Dokończ `where_it_failed(text)`, które bierze tekst śladu stosu i zwraca słownik z:

- `"error"`: rodzajem błędu, jak `ZeroDivisionError`,
- `"message"`: tym, co jest po dwukropku w ostatniej linii, albo `""`, gdy błąd nie ma komunikatu,
- `"function"`: nazwą funkcji z ostatniej linii `File`, która wynosi `<module>`, gdy błąd zdarzył się poza jakąkolwiek funkcją,
- `"line"`: numerem linii z ostatniej linii `File`, jako liczbą całkowitą.

Kod daje ci `FRAME`, wyrażenie regularne dla linii `File`, z grupami `file`, `line` i `function`, oraz ślady stosu z tabeli jako `AVERAGE`, `MISSING_KEY`, `BAD_PRICE`, `BARE_RAISE` i `NO_FILE`.

| Wywołanie                     | Zwraca                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `where_it_failed(AVERAGE)`    | `{"error": "ZeroDivisionError", "message": "division by zero", "function": "average", "line": 7}`           |
| `where_it_failed(BARE_RAISE)` | `{"error": "ValueError", "message": "", "function": "<module>", "line": 3}`                                 |

Spróbuj `print(AVERAGE)`, żeby zobaczyć jeden z nich. Tekst może mieć wokół siebie puste linie albo znak nowej linii, które zdejmuje `strip()`, a sam komunikat może mieć w sobie dwukropek, więc dziel ostatnią linię tylko na **pierwszym** `": "`.

> [!TIP]
> `text.partition(": ")` dzieli na pierwszym dwukropku i daje trzy części, a bez dwukropka dwie ostatnie są puste. `FRAME.search(line)` daje `None` dla linii, która nie jest linią `File`.
