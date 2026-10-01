---
description: Zamień sekundy na tekst w rodzaju 1h 2m 5s, a taki tekst z powrotem na sekundy.
---

# Stoper

*Korzysta z lekcji [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md), ze względu na `//`, `%` i `join()`, [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), ze względu na `split()`, oraz [Listy list](../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md), ze względu na wycinki i `raise`.*

Stoper pokazuje czas w rodzaju `1h 2m 5s`. Napisz dwie funkcje, które zamieniają taki czas na liczbę sekund i z powrotem:

- `format_time(seconds)` zwraca czas jako tekst, z godzinami, minutami i sekundami, pomijając części równe 0: 3600 sekund to `1h`, a nie `1h 0m 0s`. Zero sekund to `0s`, bo inaczej nie byłoby czego pokazać. Nie ma dni: 90000 sekund to `25h`. Ujemna liczba sekund zgłasza `ValueError`.
- `parse_time(text)` robi odwrotnie. `text` składa się z części takich jak `1h`, `2m` i `5s`, oddzielonych spacjami: każda to liczba całkowita, a po niej jej jednostka, `h`, `m` albo `s`, w dowolnej kolejności. Funkcja zwraca liczbę sekund wszystkich części razem. Pusty tekst to 0 sekund. Część z inną jednostką, na przykład `5x`, zgłasza `ValueError`.

| Wywołanie                | Zwraca               |
| ------------------------ | -------------------- |
| `format_time(3725)`      | `'1h 2m 5s'`         |
| `format_time(3600)`      | `'1h'`               |
| `format_time(0)`         | `'0s'`               |
| `format_time(-1)`        | zgłasza `ValueError` |
| `parse_time("1h 2m 5s")` | `3725`               |
| `parse_time("45s 1m")`   | `105`                |
| `parse_time("5x")`       | zgłasza `ValueError` |

Sformatowanie czasu, a potem odczytanie tekstu powinno dać z powrotem liczbę sekund, od której zaczynasz.

> [!TIP]
> W części takiej jak `12m` jednostka to jej ostatni znak, `part[-1]`, a liczba to wszystko przed nim, `part[:-1]`, które `int()` zamienia na liczbę.
