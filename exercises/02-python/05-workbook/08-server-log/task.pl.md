---
description: Posortuj wiersze dziennika serwera według poziomu, znajdź najpoważniejszy poziom i zapisz raport.
---

# Dziennik serwera

*Korzysta z lekcji [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md), ze względu na wychodzenie z funkcji w pętli, oraz [Listy list](../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md), ze względu na wycinki i `join()`.*

Serwer zapisuje to, co się dzieje, w pliku `server.log`, po wierszu na każde zdarzenie: jego poziom, czyli `ERROR`, `WARN`, `INFO` albo `DEBUG`, a potem komunikat z jednego lub więcej słów. Oto jego pierwsze trzy wiersze:

```text
INFO server started
INFO listening on port 8080
WARN disk almost full
```

Napisz trzy funkcje:

- `read_log(path)` czyta plik w `path` i zwraca słownik z każdym poziomem, który się w nim pojawia, i listą jego komunikatów, w takiej kolejności, w jakiej są w pliku: `{'INFO': ['server started', 'listening on port 8080', ...], 'WARN': ['disk almost full', ...]}`.
- `worst_level(log)` bierze taki słownik i zwraca najpoważniejszy poziom, który ma w nim komunikaty. W edytorze jest lista `LEVELS`, od najpoważniejszego poziomu do najmniej poważnego. Dla pustego dziennika nie ma poziomu do zwrócenia, więc zwraca `None`.
- `write_report(log, path)` zapisuje raport do pliku w `path`. Dla każdego poziomu, który ma komunikaty, od najpoważniejszego, zapisuje wiersz z poziomem i liczbą jego komunikatów, jak `WARN (2)`, a potem wiersz dla każdego komunikatu, który zaczyna się od `- `. Poziomów bez komunikatów w raporcie nie ma.

| Wywołanie                                     | Zwraca    |
| --------------------------------------------- | --------- |
| `worst_level({'INFO': ['a'], 'WARN': ['b']})` | `'WARN'`  |
| `worst_level({'DEBUG': ['a']})`               | `'DEBUG'` |
| `worst_level({})`                             | `None`    |

Program pod funkcjami czyta `server.log`, zapisuje raport do `report.txt` i go wypisuje. Gdy twoje funkcje działają, raport zaczyna się tak:

```text
ERROR (2)
- cannot open database
- disk write failed
WARN (2)
```

Sprawdzenia korzystają jeszcze z dwóch plików: `quiet.log`, w którym nie ma błędów ani ostrzeżeń, i `empty.log`, który nie ma żadnych wierszy.
