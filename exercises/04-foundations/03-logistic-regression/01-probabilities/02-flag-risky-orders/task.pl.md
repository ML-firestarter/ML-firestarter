---
description: Znajdź, gdzie zmienia się decyzja reguły, i wybierz zamówienia, o których reguła przewiduje, że zostaną anulowane.
---

# Oznacz ryzykowne zamówienia

Firma chce proponować zniżkę przy każdym zamówieniu, o którym reguła przewiduje, że zostanie anulowane. Napisz dwie funkcje:

- `boundary(w, b)` zwraca granicę decyzyjną reguły z wagą `w` i wyrazem wolnym `b`: czas oczekiwania, przy którym wynik prostej wynosi 0, a prawdopodobieństwo 0,5, jak w części [Od prawdopodobieństwa do decyzji](../../../../../notes/04-foundations/03-logistic-regression/01-probabilities.pl.md#od-prawdopodobieństwa-do-decyzji). Gdy `w` wynosi 0, wynik prostej jest taki sam dla każdego czasu oczekiwania, więc granicy nie ma, a `boundary` zgłasza `ValueError`.
- `flagged(waits, w, b)` dostaje listę czasów oczekiwania i zwraca listę tych, przy których reguła przewiduje anulowanie, przy progu 0,5, w tej samej kolejności. Czas oczekiwania leżący dokładnie na granicy się liczy, bo jego prawdopodobieństwo wynosi dokładnie 0,5.

| Wywołanie                                    | Zwraca               |
| -------------------------------------------- | -------------------- |
| `boundary(0.5, -4)`                          | `8.0`                |
| `boundary(0.4, -2)`                          | `5.0`                |
| `boundary(0, 1)`                             | zgłasza `ValueError` |
| `flagged([2, 4, 6, 8, 10, 12, 14], 0.5, -4)` | `[8, 10, 12, 14]`    |
| `flagged([3, 9, 5], 0.5, -4)`                | `[9]`                |
| `flagged([2, 10], -0.5, 4)`                  | `[2]`                |

Przy wadze 0 reguła daje każdemu zamówieniu to samo prawdopodobieństwo, więc `flagged` wybiera albo wszystkie czasy oczekiwania, albo żaden. Przy ujemnej wadze prawdopodobieństwo maleje, gdy czas oczekiwania rośnie. Jeśli ostatnie wywołanie daje `[10]`, `flagged` wybiera czasy oczekiwania od granicy wzwyż, co działa tylko przy dodatniej wadze. Decydowanie na podstawie znaku wyniku prostej działa przy każdej wadze.
