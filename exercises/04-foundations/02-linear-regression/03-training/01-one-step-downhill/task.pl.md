---
description: Policz nachylenie straty względem obu parametrów i zrób jeden krok w przeciwną stronę.
---

# Jeden krok w dół

Dokończ dwie funkcje:

- `slopes(kms, fares, w, b)` zwraca listę `[slope_w, slope_b]`: nachylenie MSE względem `w` i względem `b` dla prostej o tych parametrach. Już liczy `slope_w`, ale `slope_b` zostaje równe 0.
- `step(kms, fares, w, b, learning_rate)` robi jeden krok spadku gradientu od `w` i `b` i zwraca nowe parametry jako listę `[w, b]`.

Nachylenie względem `b` liczy się tak samo jak względem `w`, tylko bez mnożenia przez odległość, jak w części [Oba parametry naraz](../../../../../notes/04-foundations/02-linear-regression/03-training.pl.md#oba-parametry-naraz). `step` może wywołać `slopes`.

| Wywołanie                                            | Zwraca            |
| ---------------------------------------------------- | ----------------- |
| `slopes([2, 4, 6, 8], [14, 20, 26, 32], 0, 8)`       | `[-180.0, -30.0]` |
| `slopes([2, 4, 6, 8], [15, 23, 29, 33], 3, 10)`      | `[0.0, 0.0]`      |
| `step([2, 4, 6, 8], [14, 20, 26, 32], 0, 8, 0.01)`   | `[1.8, 8.3]`      |
| `step([2, 4, 6, 8], [15, 23, 29, 33], 3, 10, 0.01)`  | `[3.0, 10.0]`     |

Przy najlepszej prostej oba nachylenia wynoszą 0, więc krok zostawia parametry na miejscu. Jeśli `step` przesuwa je w złą stronę, sprawdź znak: krok odejmuje nachylenie, a nie je dodaje.
