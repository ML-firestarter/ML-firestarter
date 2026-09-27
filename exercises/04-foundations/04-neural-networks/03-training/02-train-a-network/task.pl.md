---
description: Przygotuj losowy start z ziarna i wytrenuj od niego sieć metodą spadku gradientu.
---

# Wytrenuj sieć

Dokończ dwie funkcje:

- `start(seed)` zwraca losowy start sieci, tak jak w części [Od czego zacząć](../../../../../notes/04-foundations/04-neural-networks/03-training.pl.md#od-czego-zacząć): ustawia ziarno na `seed`, a potem daje każdemu z 7 parametrów losową liczbę między −1 a 1, w kolejności `w1`, `b1`, `w2`, `b2`, `v1`, `v2`, `c`.
- `train(xs, turned_down, learning_rate, steps, seed)` trenuje sieć tak jak w części [Trenowanie sieci](../../../../../notes/04-foundations/04-neural-networks/03-training.pl.md#trenowanie-sieci): zaczyna od `start(seed)`, robi `steps` kroków spadku gradientu na wszystkich zamówieniach z `xs` ze współczynnikiem uczenia `learning_rate` i zwraca parametry, na których skończyła.

Funkcje `loss`, `slopes` i te, z których korzystają, są gotowe. `KMS` i `TURNED_DOWN` to osiem zamówień z lekcji, a `XS` ich odległości od środka, czyli od 7 km.

| Wywołanie                                                                 | Zwraca                                                                                                  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `start(7)`                                                                | około `{"w1": -0.352, "b1": -0.698, "w2": 0.302, "b2": -0.855, "v1": 0.072, "v2": -0.269, "c": -0.884}` |
| `train(XS, TURNED_DOWN, 0.5, 0, 7)`                                       | to samo co `start(7)`                                                                                   |
| `train(XS, TURNED_DOWN, 0.5, 1, 7)`                                       | około `{"w1": -0.355, "b1": -0.698, "w2": 0.283, "b2": -0.858, "v1": 0.117, "v2": -0.216, "c": -0.773}` |
| `round(loss(XS, TURNED_DOWN, train(XS, TURNED_DOWN, 0.5, 5000, 7)), 3)`   | `0.005`                                                                                                 |
| `round(loss(KMS, TURNED_DOWN, train(KMS, TURNED_DOWN, 0.5, 5000, 1)), 2)` | `0.49`                                                                                                  |

Tabela zaokrągla parametry do 3 miejsc po przecinku, ale sprawdzenia tego nie robią. Dwa ostatnie wywołania same zaokrąglają stratę, żeby nie liczyły się maleńkie różnice w obliczeniach z 5000 kroków. Ostatnie wywołanie zaczyna od ziarna 1, z km jako wejściem: to start, który utyka w części [Nie każdy start się udaje](../../../../../notes/04-foundations/04-neural-networks/03-training.pl.md#nie-każdy-start-się-udaje).

Jeśli liczby z `start(7)` są poprawne, ale trafiają do złych parametrów, losowe liczby są przydzielane w innej kolejności. Jeśli jeden krok daje inne parametry niż w tabeli, sprawdź, czy `train` liczy wszystkie 7 nachyleń, zanim zmieni którykolwiek parametr.
