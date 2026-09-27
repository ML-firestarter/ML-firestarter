---
description: Policz nachylenia straty logarytmicznej względem obu parametrów i zrób jeden krok w przeciwną stronę.
---

# Jeden krok treningu

Dokończ dwie funkcje. Tak jak wcześniej, `waits` zawiera czas oczekiwania każdego zamówienia, a `cancelled` jego etykietę, 1 albo 0, w tej samej kolejności.

- `slopes(waits, cancelled, w, b)` zwraca listę `[slope_w, slope_b]`: nachylenie straty logarytmicznej względem `w` i względem `b` dla reguły o tych parametrach. Pętla już liczy prawdopodobieństwo `p` każdego zamówienia, ale nic nie dodaje do nachyleń.
- `step(waits, cancelled, w, b, learning_rate)` robi jeden krok spadku gradientu od `w` i `b` i zwraca nowe parametry jako listę `[w, b]`.

Każde zamówienie dodaje do nachyleń tak jak w części [Wzór na nachylenie](../../../../../notes/04-foundations/03-logistic-regression/03-training.pl.md#wzór-na-nachylenie): do nachylenia względem `w` swój błąd, `p` minus etykieta, razy czas oczekiwania, a do nachylenia względem `b` sam błąd, w obu przypadkach podzielony przez liczbę zamówień. `step` może wywołać `slopes`.

| Wywołanie                                                       | Zwraca                |
| --------------------------------------------------------------- | --------------------- |
| `slopes([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0, 0)`       | około `[-1.333, 0.0]` |
| `slopes([2, 4, 6, 8], [1, 0, 0, 1], 0, 0)`                      | `[0.0, 0.0]`          |
| `step([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0, 0, 0.1)`    | około `[0.133, 0.0]`  |
| `step([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.5, -4, 0.1)` | około `[0.477, -4.0]` |

Tabela zaokrągla liczby do 3 miejsc po przecinku, ale sprawdzenia tego nie robią. Ostatnie wywołanie zaczyna od reguły z pierwszej lekcji, a krok sprawia, że staje się ona mniej stroma, bliższa najlepszej regule dla tych sześciu zamówień.

Jeśli `step` przesuwa parametry w złą stronę, sprawdź znak: krok odejmuje nachylenie, a nie je dodaje. Jeśli nachylenia wychodzą dwa razy większe niż w tabeli, są liczone tak jak te dla MSE, ale nachylenia straty logarytmicznej nie mają dwójki.
