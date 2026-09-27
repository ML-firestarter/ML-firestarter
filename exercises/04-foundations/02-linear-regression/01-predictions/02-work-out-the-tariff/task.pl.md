---
description: Wyznacz cenę za km i opłatę początkową z dwóch paragonów.
---

# Odtwórz cennik

Paragony z kursów bez postoju dokładnie trzymają się cennika taksówki. Napisz funkcję `tariff(km1, fare1, km2, fare2)`: dostaje odległość i opłatę z każdego z dwóch takich paragonów, wyznacza cenę za km i opłatę początkową tak, jak zrobiła to lekcja [Przewidywanie](../../../../../notes/04-foundations/02-linear-regression/01-predictions.pl.md#skąd-się-biorą-w-i-b), i zwraca je jako listę `[w, b]`.

Gdy oba paragony dotyczą tej samej odległości, ceny za km nie da się wyznaczyć, więc `tariff` zgłasza `ValueError`.

| Wywołanie              | Zwraca               |
| ---------------------- | -------------------- |
| `tariff(3, 17, 7, 29)` | `[3.0, 8.0]`         |
| `tariff(2, 10, 4, 13)` | `[1.5, 7.0]`         |
| `tariff(5, 30, 1, 10)` | `[5.0, 5.0]`         |
| `tariff(4, 10, 4, 12)` | zgłasza `ValueError` |

Drugi paragon może dotyczyć krótszego kursu niż pierwszy, jak w trzecim wywołaniu. Jeśli `tariff(2, 10, 4, 13)` daje `[1, 8]`, dzielisz za pomocą `//`, które zaokrągla w dół: użyj `/`.
