---
description: Wytrenuj regresję liniową na dowolnej tabeli cech tensorami i autogradem, zaczynając od zer, i zwróć to, co znalazła.
---

# Dopasuj prostą

[Trening](../../../../notes/05-pytorch/04-linear-regression-by-hand.pl.md#trening) wytrenował regresję liniową pętlą z czterech kroków. Dokończ `fit(X, y, learning_rate, n_epochs)`, które robi to dla dowolnej tabeli. `X` ma wiersz dla każdego kursu i kolumnę dla każdej cechy, a `y` etykiety, o kształcie `[rides, 1]`. `fit` zaczyna od wag równych 0, po jednej na cechę, i wyrazu wolnego 0, wykonuje `n_epochs` kroków spadku gradientu na błędzie średniokwadratowym i zwraca parę `(weights, bias)`: wagi jako listę liczb, a wyraz wolny jako liczbę.

Kod ma już parametry i wiersz `loss = ...`. Brakuje pozostałych kroków: `backward()`, kroku wewnątrz `torch.no_grad()` i wyzerowania nachyleń. `X` i `y` zawierają kursy dzienne z lekcji.

| Wywołanie               | Zwraca                       |
| ----------------------- | ---------------------------- |
| `fit(X, y, 0.01, 0)`    | `([0.0, 0.0], 0.0)`          |
| `fit(X, y, 0.01, 1)`    | około `([2.8, 2.04], 0.5)`   |
| `fit(X, y, 0.01, 5000)` | około `([3.0, 0.5], 8.0)`    |

Po 5000 epokach prosta jest prostą z naklejki: 3 zł za kilometr, 0,50 zł za minutę postoju i 8 zł na start, bo kursy dzienne dokładnie jej podlegają. Testy używają też tabel z inną liczbą cech, więc liczbę wag weź z `X`, a nie z liczby wpisanej w kodzie. Jeśli druga epoka zachodzi dalej, niż powinna, nachylenia pierwszej nie zostały wyzerowane.
