---
description: Uśrednij nachylenia zamówień z minipaczki i zrób nimi krok spadku gradientu.
---

# Nachylenia minipaczki

Dokończ dwie funkcje. `xs` zawiera wejście każdego zamówienia z minipaczki, a `turned_down` jego etykietę, 1 albo 0, w tej samej kolejności. W sprawdzeniach wejściami są długości kursów w km.

- `slopes(xs, turned_down, net)` zwraca nachylenia straty logarytmicznej zamówień z `xs` względem wszystkich 7 parametrów, jako słownik z tymi samymi nazwami co w `net`: dla każdego parametru średnią nachyleń zamówień, tak jak w części [Wszystkie osiem zamówień](../../../../../notes/04-foundations/04-neural-networks/02-backpropagation.pl.md#wszystkie-osiem-zamówień). Funkcja `order_slopes` jest gotowa i daje nachylenia jednego zamówienia. Na razie `slopes` ustawia każde nachylenie na 0, ale nic do nich nie dodaje.
- `step(xs, turned_down, net, learning_rate)` robi jeden krok spadku gradientu od `net`, z nachyleniami zamówień z `xs`, i zwraca nowe parametry jako nowy słownik. Nie może zmieniać `net`.

| Wywołanie                          | Zwraca                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `slopes([3, 12], [1, 1], NET)`     | około `{"w1": -1.097, "b1": -0.366, "w2": -0.938, "b2": -0.078, "v1": -0.183, "v2": -0.164, "c": -0.552}` |
| `slopes(KMS, TURNED_DOWN, NET)`    | około `{"w1": -0.261, "b1": -0.09, "w2": -0.2, "b2": -0.016, "v1": -0.079, "v2": -0.074, "c": -0.177}`    |
| `step(KMS, TURNED_DOWN, NET, 0.5)` | około `{"w1": -1.87, "b1": 6.045, "w2": 2.1, "b2": -21.992, "v1": 4.04, "v2": 4.037, "c": -2.912}`        |

Tabela zaokrągla liczby do 3 miejsc po przecinku, ale sprawdzenia tego nie robią. `KMS` i `TURNED_DOWN` to osiem zamówień z lekcji, a ostatnie wywołanie to krok z początku lekcji [Trening sieci](../../../../../notes/04-foundations/04-neural-networks/03-training.pl.md).

Jeśli nachylenia dla wszystkich ośmiu zamówień wychodzą 8 razy większe niż w tabeli, są sumowane, ale nie są dzielone przez liczbę zamówień. Jeśli `NET` zmienia się po wywołaniu `step`, funkcja `step` zmienia słownik, który dostała: zapisz nowe parametry w nowym słowniku albo w kopii zrobionej przez `dict(net)`.
