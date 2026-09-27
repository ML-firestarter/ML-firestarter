---
description: Wytrenuj prostą na dowolnych paragonach metodą spadku gradientu.
---

# Wytrenuj prostą

Napisz funkcję `train(kms, fares, learning_rate, steps)`, która trenuje prostą na paragonach metodą spadku gradientu: zaczyna od `w = 0` i `b = 0`, robi `steps` kroków ze współczynnikiem uczenia `learning_rate` i zwraca parametry, na których skończyła, jako listę `[w, b]`.

| Wywołanie                                           | Zwraca                 |
| --------------------------------------------------- | ---------------------- |
| `train([2, 4, 6, 8], [14, 20, 26, 32], 0.01, 1)`    | `[2.6, 0.46]`          |
| `train([2, 4, 6, 8], [14, 20, 26, 32], 0.01, 0)`    | `[0, 0]`               |
| `train([2, 4, 6, 8], [15, 23, 29, 33], 0.01, 5000)` | około `[3.0, 10.0]`    |

Po wielu krokach parametry są bardzo blisko najlepszych, ale jeszcze nie całkiem, na przykład 9,9999992 zamiast 10, więc sprawdzenia najpierw zaokrąglają je do 2 miejsc po przecinku.

Jeśli jeden krok daje `[2.6, 0.2]`, nachylenie względem `b` zostało policzone już z nowym `w`. Najpierw policz oba nachylenia, a dopiero potem zmień parametry.
