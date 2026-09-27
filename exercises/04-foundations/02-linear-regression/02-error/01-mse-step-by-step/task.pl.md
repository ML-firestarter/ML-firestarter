---
description: Zapisz błąd średniokwadratowy jako małe funkcje, po jednej na każdy krok.
---

# MSE krok po kroku

Błąd średniokwadratowy powstaje w pięciu krokach: przewidź, odejmij, podnieś do kwadratu, dodaj i podziel. Tutaj predykcje są już gotowe, a każdy z pozostałych kroków dostaje własną małą funkcję, więc gdy jakieś sprawdzenie nie przechodzi, jego funkcja to krok do poprawienia. `errors` jest gotowa. Dokończ pozostałe trzy:

- `errors(predictions, fares)` zwraca listę błędów: każda predykcja minus jej opłata.
- `squares(numbers)` zwraca listę liczb, każdą podniesioną do kwadratu.
- `mean(numbers)` zwraca średnią liczb: ich sumę podzieloną przez to, ile ich jest.
- `mse(predictions, fares)` zwraca błąd średniokwadratowy predykcji, korzystając z trzech funkcji powyżej.

`sum()` dodaje liczby z listy: `sum([1, 9, 9, 1])` to `20`.

| Wywołanie                                    | Zwraca             |
| -------------------------------------------- | ------------------ |
| `errors([14, 20, 26, 32], [15, 23, 29, 33])` | `[-1, -3, -3, -1]` |
| `squares([-1, -3, -3, -1])`                  | `[1, 9, 9, 1]`     |
| `mean([1, 9, 9, 1])`                         | `5.0`              |
| `mse([14, 20, 26, 32], [15, 23, 29, 33])`    | `5.0`              |
| `mse([25, 25, 25, 25], [15, 23, 29, 33])`    | `46.0`             |
