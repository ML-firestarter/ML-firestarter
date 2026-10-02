---
description: Wystandaryzuj kolumny tabeli operacjami na tensorach i wystandaryzuj nowe wiersze ze średnimi i rozrzutami starych.
---

# Standaryzuj kolumny

[Standaryzacja wejść](../../../../notes/04-foundations/04-neural-networks/04-inputs.pl.md#standaryzacja-wejść) odejmuje od wejścia jego średnią i dzieli to, co zostaje, przez jego rozrzut. Dla tabeli kursów jest średnia i rozrzut dla każdej kolumny, jak w części [Rozgłaszanie: standaryzacja kolumn](../../../../notes/05-pytorch/01-tensors.pl.md#rozgłaszanie-standaryzacja-kolumn). Dokończ dwie funkcje:

- `standardize_like(table, new_table)` zwraca `new_table` wystandaryzowaną ze średnimi i rozrzutami kolumn `table`: od każdej kolumny `new_table` odejmuje się średnią tej samej kolumny `table` i dzieli przez jej rozrzut. Obie tabele mają te same kolumny i dowolną liczbę wierszy.
- `standardize(table)` standaryzuje tabelę z jej własnymi średnimi i rozrzutami. Może wywołać `standardize_like`.

Rozrzut to odchylenie standardowe tak, jak liczą je lekcje: średnia z kwadratów odległości od średniej, a potem pierwiastek kwadratowy. `DAY` zawiera cztery kursy z lekcji.

| Wywołanie                                                       | Zwraca                                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `standardize(DAY)`                                              | `tensor([[-1.3416, -1.0000], [-0.4472, 1.0000], [0.4472, 1.0000], [1.3416, -1.0000]])` |
| `standardize_like(DAY, torch.tensor([[7.0, 8.0], [3.0, 0.0]]))` | `tensor([[0.8944, 2.0000], [-0.8944, -2.0000]])`                                       |
| `standardize_like(DAY, torch.tensor([[5.0, 4.0]]))`             | `tensor([[0., 0.]])`                                                                   |

Trzecie wywołanie to kurs ze średnią odległością i średnim postojem z `DAY`, więc wychodzi 0 w obu kolumnach. Testy zaokrąglają liczby do 3 miejsc po przecinku, bo liczby w tensorze są dokładne tylko do około 7 cyfr. Jeśli twoje liczby wychodzą trochę za małe, jak `-1.1619` zamiast `-1.3416`, sprawdź, przez co dzieli `std`: domyślnie przez o jeden mniej niż liczba kursów, a lekcje dzielą przez liczbę kursów.
