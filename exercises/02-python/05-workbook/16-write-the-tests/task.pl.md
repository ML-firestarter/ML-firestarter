---
description: Napisz przypadki testowe dla funkcji roku przestępnego, na tyle dobre, żeby złapały trzy jej wersje, z których każda ma błąd.
---

# Napisz testy

*Korzysta z lekcji [Testowanie kodu](../../../../notes/02-python/03-errors-and-testing/02-testing-your-code.pl.md) dla wyboru przypadków oraz [Warunki i funkcje](../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md) dla reguł roku przestępnego.*

Tym razem nie piszesz funkcji: piszesz jej **testy**. Rok jest przestępny, gdy dzieli się przez 4, chyba że dzieli się przez 100, o ile nie dzieli się też przez 400. `is_leap(year)` jest napisane i jest dobre. Napisane są też trzy kolejne funkcje i każda ma błąd, którego nieuważny test by nie zauważył:

- `ignores_hundreds` zapomina o regule dla lat podzielnych przez 100,
- `ignores_four_hundreds` zapomina, że lata podzielne przez 400 są jednak przestępne,
- `uses_two_hundreds` ma 200 tam, gdzie powinno być 400.

Dokończ `leap_cases()`, które zwraca listę przypadków testowych, `(year, expected)`, gdzie `expected` to `True` albo `False`. Dobre przypadki robią dwie rzeczy naraz: każdy przypadek jest **dobry**, więc poprawne `is_leap` przechodzi wszystkie, a przypadki razem **łapią** każdy z trzech błędów, co znaczy, że dla każdej złej funkcji co najmniej jeden przypadek sprawia, że daje złą odpowiedź.

Testy szukają tych rzeczy:

- co najmniej 4 przypadków, każdy z rokiem jako liczbą całkowitą i `True` albo `False`, bez roku dwa razy,
- poprawne `is_leap` ma dobrze każdy przypadek, a wśród nich jest rok przestępny i rok, który nie jest,
- każda z trzech złych funkcji ma co najmniej jeden przypadek źle,
- któryś przypadek to rok podzielny przez 100, który nie jest przestępny, a któryś podzielny przez 400, który jest.

| Przypadek        | Dlaczego warto go mieć                                      |
| ---------------- | ----------------------------------------------------------- |
| `(2023, False)`  | zwykły rok, który każda wersja ma dobrze                    |
| `(1900, False)`  | łapie wersję, która zapomina o regule 100                   |

Program pod funkcjami wypisuje każdy przypadek i to, czy `is_leap` się z nim zgadza.

> [!TIP]
> Zapytaj o każdą złą funkcję: dla jakich lat różni się od dobrej? Lata podzielne przez 100, ale nie przez 400, łapią dwie z nich, a lata podzielne przez 400 łapią pozostałą, i domysł możesz sprawdzić, uruchamiając złą funkcję na nim.
