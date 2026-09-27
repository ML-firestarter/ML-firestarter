---
description: Zapisz stratę logarytmiczną jako małe funkcje, po jednej na każdy krok.
---

# Strata logarytmiczna krok po kroku

Strata logarytmiczna powstaje w pięciu krokach: przewidź, wybierz prawdopodobieństwo tego, co się stało, weź jego logarytm i zmień znak, dodaj i podziel. Tutaj predykcje są już gotowe, a każdy z pozostałych kroków dostaje własną małą funkcję, więc gdy jakieś sprawdzenie nie przechodzi, jego funkcja to krok do poprawienia. `given` jest gotowa. Dokończ pozostałe trzy:

- `given(ps, ys)` zwraca listę prawdopodobieństw, które reguła dała temu, co się stało: dla każdego zamówienia jego prawdopodobieństwo `p`, jeśli etykieta wynosi 1, i `1 - p`, jeśli wynosi 0.
- `penalties(qs)` zwraca listę kar, po jednej dla każdego prawdopodobieństwa `q`: minus jego logarytm naturalny. `math.log(q)` liczy logarytm naturalny z `q`.
- `mean(numbers)` zwraca średnią liczb: ich sumę podzieloną przez to, ile ich jest.
- `log_loss(ps, ys)` zwraca stratę logarytmiczną predykcji `ps` dla etykiet `ys`, korzystając z trzech funkcji powyżej.

| Wywołanie                             | Zwraca                 |
| ------------------------------------- | ---------------------- |
| `given([0.75, 0.75, 0.5], [1, 0, 1])` | `[0.75, 0.25, 0.5]`    |
| `penalties([0.5, 0.25])`              | około `[0.693, 1.386]` |
| `mean([1, 2, 6])`                     | `3.0`                  |
| `log_loss([0.5, 0.5], [1, 0])`        | około `0.693`          |
| `log_loss([0.9, 0.9], [1, 0])`        | około `1.204`          |

Tabela zaokrągla niektóre liczby do 3 miejsc po przecinku, ale sprawdzenia tego nie robią, więc nie zaokrąglaj ich w funkcjach.

Jeśli kary wychodzą ujemne, brakuje im minusa: logarytm prawdopodobieństwa nigdy nie jest większy od 0.
