---
description: Wytrenuj regresję logistyczną na dowolnych zamówieniach metodą spadku gradientu.
---

# Wytrenuj klasyfikator

Napisz funkcję `train(waits, cancelled, learning_rate, steps)`, która trenuje regułę na zamówieniach metodą spadku gradientu: zaczyna od `w = 0` i `b = 0`, robi `steps` kroków ze współczynnikiem uczenia `learning_rate` i zwraca parametry, na których skończyła, jako listę `[w, b]`. Tak jak wcześniej, `waits` zawiera czas oczekiwania każdego zamówienia, a `cancelled` jego etykietę, 1 albo 0, w tej samej kolejności.

| Wywołanie                                                     | Zwraca                |
| ------------------------------------------------------------- | --------------------- |
| `train([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.1, 1)`    | około `[0.133, 0.0]`  |
| `train([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.1, 0)`    | `[0, 0]`              |
| `train([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.1, 5000)` | około `[0.37, -2.93]` |
| `train([2, 4, 6, 10, 12, 14], [1, 1, 0, 1, 0, 0], 0.1, 5000)` | około `[-0.37, 2.93]` |

Po wielu krokach parametry są bardzo blisko najlepszych, ale jeszcze nie całkiem, więc sprawdzenia najpierw zaokrąglają je do 2 miejsc po przecinku. W ostatnim wywołaniu każda etykieta jest odwrócona, a razem z nimi znaki najlepszych parametrów.

Jeśli jeden krok daje `[0.133, -0.023]`, nachylenie względem `b` zostało policzone już z nowym `w`. Najpierw policz oba nachylenia, a dopiero potem zmień parametry.
