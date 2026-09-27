---
description: Zrób przejście w przód i wstecz dla jednego zamówienia i zwróć nachylenia jego kary względem wszystkich 7 parametrów.
---

# Siedem nachyleń

Napisz funkcję `order_slopes(km, turned_down, net)`, która zwraca nachylenia kary jednego zamówienia względem wszystkich 7 parametrów sieci `net`, jako słownik z tymi samymi nazwami co w `net`. `km` to długość kursu, a `turned_down` etykieta zamówienia, 1 albo 0. Tak jak w części [Przekazywanie błędu wstecz](../../../../../notes/04-foundations/04-neural-networks/02-backpropagation.pl.md#przekazywanie-błędu-wstecz), potrzebne są dwa przejścia:

1. Przejście w przód liczy `h1`, `h2` i `p`.
2. Przejście wstecz liczy błąd neuronu wyjściowego, `delta = p - turned_down`, a z niego błędy obu neuronów ukrytych, `delta1` i `delta2`. Każde nachylenie to wtedy błąd neuronu razy wejście, które mnoży dany parametr, a dla wyrazu wolnego sam błąd.

`sigmoid` jest gotowa, a `NET` zawiera 7 parametrów z lekcji.

| Wywołanie                  | Zwraca                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `order_slopes(3, 1, NET)`  | około `{"w1": -2.193, "b1": -0.731, "w2": 0.0, "b2": 0.0, "v1": -0.366, "v2": 0.0, "c": -0.731}` |
| `order_slopes(12, 1, NET)` | około `{"w1": 0.0, "b1": 0.0, "w2": -1.875, "b2": -0.156, "v1": 0.0, "v2": -0.328, "c": -0.372}` |
| `order_slopes(11, 0, NET)` | około `{"w1": 0.0, "b1": 0.0, "w2": 2.958, "b2": 0.269, "v1": 0.0, "v2": 0.134, "c": 0.269}`     |

Tabela zaokrągla liczby do 3 miejsc po przecinku, ale sprawdzenia tego nie robią. Nachylenia pokazane jako `0.0` są maleńkie, ale nie wynoszą dokładnie 0, bo płaskie części S nigdy nie są całkiem płaskie. W `NET` zarówno `v1`, jak i `v2` wynoszą 4, więc sprawdzenia próbują też innych sieci, w których pomylenie ich od razu widać.

Jeśli nachylenie względem `w1` w pierwszym wywołaniu wynosi około `-8.773`, w `delta1` brakuje nachylenia sigmoidy, `h1 * (1 - h1)`. Jeśli każde nachylenie ma zły znak, błąd neuronu wyjściowego został policzony jako etykieta minus `p` zamiast `p` minus etykieta.
