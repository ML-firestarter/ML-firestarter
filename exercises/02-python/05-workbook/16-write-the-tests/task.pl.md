---
description: Napisz przypadki testowe dla funkcji, która sprawdza, czy rok jest przestępny, na tyle dobre, żeby wykryły błędy w trzech jej wersjach.
---

# Napisz testy

*Korzysta z lekcji [Testowanie kodu](../../../../notes/02-python/03-errors-and-testing/02-testing-your-code.pl.md), z której przyda się dobieranie przypadków, oraz z lekcji [Warunki i funkcje](../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md), z której przydadzą się reguły lat przestępnych.*

Tym razem nie piszesz funkcji, tylko jej **testy**. Rok jest przestępny, gdy dzieli się przez 4, chyba że dzieli się przez 100, bo taki rok jest przestępny tylko wtedy, gdy dzieli się też przez 400. `is_leap(year)` jest już gotowe i działa poprawnie. Gotowe są też trzy inne wersje tej funkcji, a każda ma błąd, którego nieuważny test by nie zauważył:

- `ignores_hundreds` zapomina o regule dla lat podzielnych przez 100,
- `ignores_four_hundreds` zapomina, że lata podzielne przez 400 są jednak przestępne,
- `uses_two_hundreds` ma 200 tam, gdzie powinno być 400.

Dokończ funkcję `leap_cases()`, która zwraca listę przypadków testowych `(year, expected)`, gdzie `expected` to `True` albo `False`. Dobre przypadki spełniają dwa warunki naraz: każdy z nich jest **poprawny**, więc poprawne `is_leap` przechodzi wszystkie, a razem **wykrywają** każdy z trzech błędów, czyli dla każdej błędnej wersji co najmniej jeden przypadek sprawia, że daje ona złą odpowiedź.

Testy sprawdzają, czy:

- są co najmniej 4 przypadki, każdy z rokiem jako liczbą całkowitą i z `True` albo `False`, i żaden rok się nie powtarza,
- poprawne `is_leap` przechodzi każdy przypadek, a wśród nich jest i rok przestępny, i nieprzestępny,
- każda z trzech błędnych wersji nie przechodzi co najmniej jednego przypadku,
- jeden z przypadków to rok podzielny przez 100, który nie jest przestępny, a inny to rok podzielny przez 400, który jest.

| Przypadek       | Dlaczego warto go mieć                               |
| --------------- | ---------------------------------------------------- |
| `(2023, False)` | zwykły rok, z którym każda wersja radzi sobie dobrze |
| `(1900, False)` | wykrywa wersję, która zapomina o regule setek        |

Program pod funkcjami wypisuje każdy przypadek i to, czy `is_leap` się z nim zgadza.

> [!TIP]
> Zadaj sobie pytanie o każdą błędną wersję: dla jakich lat różni się od poprawnej? Lata podzielne przez 100, ale nie przez 400, wykrywają dwie z nich, a lata podzielne przez 400 trzecią. Swój domysł możesz sprawdzić, wywołując błędną wersję dla takiego roku.
