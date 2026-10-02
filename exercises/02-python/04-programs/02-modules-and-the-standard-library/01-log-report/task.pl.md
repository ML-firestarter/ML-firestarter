---
description: Przeczytaj log serwera internetowego z pomocą re, datetime, Counter i json i opisz, jak duży był ruch.
---

# Raport z logu

*Korzysta z lekcji [Moduły i biblioteka standardowa](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md) dla `re`, `datetime`, `Counter` i `json` oraz [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md) dla czytania pliku.*

Serwer internetowy zapisuje w logu jedną linię na każde żądanie, które dostanie. Plik `access.log` ma takie linie, z czasem, metodą, ścieżką, kodem statusu i czasem odpowiedzi:

```text
2024-03-05 09:12:44 GET /home 200 35ms
2024-03-05 10:02:33 GET /exercises 500 410ms
```

Kilka linii w pliku jest uszkodzonych: niektóre w ogóle nie są liniami logu, a w jednej jest czas, który nie istnieje. Kod ma już zaimportowane to, czego potrzebuje, a `read_entries(path)` jest napisane: czyta plik i zachowuje wpisy, które udało się zrobić `parse_line`. Dokończ trzy funkcje:

- `parse_line(line)` zwraca słownik dla linii logu, z kluczami `"time"` (`datetime`), `"method"` (`"GET"` albo `"POST"`), `"path"`, `"status"` (liczba całkowita) i `"ms"` (liczba całkowita, bez `ms`). Zwraca `None` dla linii, która nie ma tej postaci: inna metoda, status, który nie ma 3 cyfr, tekst, który w ogóle nie jest linią logu, albo czas, który nie może istnieć, jak 25:99:99. Znak nowej linii na końcu linii jest w porządku.
- `busiest_hour(path)` zwraca godzinę doby, od 0 do 23, z największą liczbą żądań. Gdy dwie godziny mają tyle samo, zwraca wcześniejszą.
- `report(path)` zwraca tekst JSON, zrobiony przez `json.dumps(..., sort_keys=True)`, ze słownika z `"requests"` (ile wpisów), `"errors"` (ile ma status 500 lub więcej), `"slowest"` (ścieżka najwolniejszego żądania) i `"top_paths"` (dwie najczęściej żądane ścieżki, jako listy ścieżki i jej liczby, najczęstsza pierwsza, a ścieżki z tą samą liczbą w kolejności alfabetycznej).

| Wywołanie                                         | Zwraca                                   |
| ------------------------------------------------- | ---------------------------------------- |
| `parse_line("2024-03-05 09:12:44 GET /home 200 35ms")["ms"]` | `35`                          |
| `parse_line("this line is not a log entry")`      | `None`                                   |
| `busiest_hour("access.log")`                      | `10`                                     |

Program pod funkcjami wypisuje raport i najbardziej ruchliwą godzinę, więc **Uruchom** pokazuje, co twoje funkcje robią z plikiem.

> [!TIP]
> Wyrażenie regularne może opisać całą linię: `re.fullmatch(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms", line)` daje `None`, gdy linia nie pasuje, a `.groups()` pięć kawałków, gdy pasuje. `datetime.strptime(text, "%Y-%m-%d %H:%M:%S")` zgłasza `ValueError` dla czasu, który nie może istnieć.
