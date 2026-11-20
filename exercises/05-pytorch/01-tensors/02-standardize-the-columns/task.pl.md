---
description: Standaryzuj kolumny tabeli działaniami na tensorach, a nowe wiersze standaryzuj średnimi i rozrzutami starych.
---

# Standaryzuj kolumny

[Standaryzacja wejść](../../../../notes/04-foundations/04-neural-networks/04-inputs.pl.md#standaryzacja-wejść) odejmuje od wejścia jego średnią i dzieli wynik przez jego rozrzut. Tabela kursów ma średnią i rozrzut dla każdej kolumny, jak w części [Rozgłaszanie: standaryzacja kolumn](../../../../notes/05-pytorch/01-tensors.pl.md#rozgłaszanie-standaryzacja-kolumn). Dokończ dwie funkcje:

- `standardize_like(table, new_table)` zwraca `new_table` wystandaryzowaną średnimi i rozrzutami kolumn `table`: od każdej kolumny `new_table` odejmuje średnią tej samej kolumny `table` i dzieli wynik przez jej rozrzut. Obie tabele mają te same kolumny i dowolną liczbę wierszy.
- `standardize(table)` standaryzuje tabelę jej własnymi średnimi i rozrzutami. Może przy tym wywołać `standardize_like`.

Rozrzut to odchylenie standardowe liczone tak jak w lekcjach: pierwiastek kwadratowy ze średniej kwadratów odległości od średniej. `DAY` zawiera cztery kursy dzienne z lekcji.

| Wywołanie                                                       | Zwraca                                                                                 |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `standardize(DAY)`                                              | `tensor([[-1.3416, -1.0000], [-0.4472, 1.0000], [0.4472, 1.0000], [1.3416, -1.0000]])` |
| `standardize_like(DAY, torch.tensor([[7.0, 8.0], [3.0, 0.0]]))` | `tensor([[0.8944, 2.0000], [-0.8944, -2.0000]])`                                       |
| `standardize_like(DAY, torch.tensor([[5.0, 4.0]]))`             | `tensor([[0., 0.]])`                                                                   |

Trzecie wywołanie to kurs ze średnią odległością i średnim postojem z `DAY`, więc w obu kolumnach wychodzi 0. Testy zaokrąglają liczby do 3 miejsc po przecinku, bo liczby w tensorze są dokładne tylko do mniej więcej 7 cyfr. Jeśli twoje liczby wychodzą nieco za małe, na przykład `-1.1619` zamiast `-1.3416`, sprawdź, przez co dzieli `std`: domyślnie przez liczbę kursów pomniejszoną o jeden, a lekcje dzielą przez liczbę kursów.
