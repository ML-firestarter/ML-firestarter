---
description: Przeczytaj log serwera WWW za pomocą re, datetime, Counter i json i opisz, jaki był ruch.
---

# Raport z logu

*Korzysta z lekcji [Moduły i biblioteka standardowa](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md), z której przydadzą się `re`, `datetime`, `Counter` i `json`, oraz z lekcji [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), z której przyda się czytanie pliku.*

Serwer WWW zapisuje w logu jedną linijkę dla każdego żądania, które dostanie. Plik `access.log` składa się z takich linijek, z datą i godziną, metodą, ścieżką, kodem statusu i czasem odpowiedzi:

```text
2024-03-05 09:12:44 GET /home 200 35ms
2024-03-05 10:02:33 GET /exercises 500 410ms
```

Kilka linijek w pliku jest uszkodzonych: niektóre w ogóle nie są wpisami logu, a w jednej jest godzina, która nie istnieje. Kod ma już potrzebne importy i gotową funkcję `read_entries(path)`, która czyta plik i zachowuje wpisy, które udało się przetworzyć przez `parse_line`. Dokończ trzy funkcje:

- `parse_line(line)` zwraca słownik dla linijki logu, z kluczami `"time"` (`datetime`), `"method"` (`"GET"` albo `"POST"`), `"path"`, `"status"` (liczba całkowita) i `"ms"` (liczba całkowita, bez `ms`). Zwraca `None` dla linijki, która nie ma tej postaci: z inną metodą, ze statusem, który nie ma 3 cyfr, z tekstem, który w ogóle nie jest wpisem logu, albo z godziną, która nie może istnieć, na przykład 25:99:99. Znak nowej linii na końcu linijki nie przeszkadza.
- `busiest_hour(path)` zwraca godzinę doby, od 0 do 23, w której było najwięcej żądań. Gdy dwie godziny mają ich tyle samo, zwraca wcześniejszą.
- `report(path)` zwraca tekst JSON utworzony przez `json.dumps(..., sort_keys=True)` ze słownika, w którym `"requests"` to liczba wpisów, `"errors"` to liczba wpisów ze statusem 500 lub wyższym, `"slowest"` to ścieżka najwolniejszego żądania, a `"top_paths"` to dwie najczęściej żądane ścieżki, każda jako lista ze ścieżką i liczbą żądań, od najczęstszej, a przy równej liczbie w kolejności alfabetycznej.

| Wywołanie                                                    | Zwraca |
| ------------------------------------------------------------ | ------ |
| `parse_line("2024-03-05 09:12:44 GET /home 200 35ms")["ms"]` | `35`   |
| `parse_line("this line is not a log entry")`                 | `None` |
| `busiest_hour("access.log")`                                 | `10`   |

Program pod funkcjami wypisuje raport i godzinę największego ruchu, więc **Uruchom** pokazuje, co twoje funkcje robią z plikiem.

> [!TIP]
> Wyrażenie regularne może opisać całą linijkę: `re.fullmatch(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms", line)` daje `None`, gdy linijka nie pasuje, a gdy pasuje, `.groups()` daje pięć kawałków. `datetime.strptime(text, "%Y-%m-%d %H:%M:%S")` zgłasza `ValueError` dla czasu, który nie może istnieć.
