---
description: Odróżnij lata przestępne od pozostałych i wypisz lata przestępne między dwoma latami.
---

# Lata przestępne

*Korzysta z lekcji [Warunki i funkcje](../../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md) i [Zakresy i listy](../../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md).*

Rok przestępny ma 29 lutego. Rok jest przestępny, gdy dzieli się bez reszty przez 4, z wyjątkiem lat podzielnych przez 100: te są przestępne tylko wtedy, gdy dzielą się też przez 400. Dlatego 2024 jest przestępny, a 2023 nie, i 1900 nie jest przestępny, ale 2000 tak.

Napisz dwie funkcje:

- `is_leap(year)` zwraca `True` dla roku przestępnego i `False` dla każdego innego.
- `leap_years(start, end)` zwraca listę lat przestępnych od `start` do `end`, łącznie z nimi, od najwcześniejszego.

| Wywołanie                | Zwraca                     |
| ------------------------ | -------------------------- |
| `is_leap(2024)`          | `True`                     |
| `is_leap(1900)`          | `False`                    |
| `is_leap(2000)`          | `True`                     |
| `leap_years(1896, 1912)` | `[1896, 1904, 1908, 1912]` |
| `leap_years(2001, 2003)` | `[]`                       |
