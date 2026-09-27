---
description: Oceń dowolną prostą na dowolnych paragonach, a do porównania także punkt odniesienia.
---

# Oceń prostą

Napisz dwie funkcje:

- `loss(kms, fares, w, b)` zwraca błąd średniokwadratowy prostej z ceną za km `w` i opłatą początkową `b` na paragonach: `kms` zawiera odległość każdego kursu, a `fares` jego opłatę, w tej samej kolejności.
- `baseline(fares)` zwraca błąd średniokwadratowy punktu odniesienia, który dla każdego kursu przewiduje średnią opłatę.

| Wywołanie                                     | Zwraca |
| --------------------------------------------- | ------ |
| `loss([2, 4, 6, 8], [15, 23, 29, 33], 3, 8)`  | `5.0`  |
| `loss([2, 4, 6, 8], [15, 23, 29, 33], 3, 10)` | `1.0`  |
| `loss([1, 3], [9, 15], 2.5, 4)`               | `9.25` |
| `baseline([15, 23, 29, 33])`                  | `46.0` |
| `baseline([7, 7, 7])`                         | `0.0`  |

Jeśli `loss` daje `20` tam, gdzie powinna dać `5.0`, to sumuje kwadraty błędów, ale nie dzieli ich przez liczbę kursów.
