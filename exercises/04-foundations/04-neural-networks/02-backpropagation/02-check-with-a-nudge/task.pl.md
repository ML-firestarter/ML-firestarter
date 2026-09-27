---
description: Policz nachylenie kary jednego zamówienia względem dowolnego parametru przesunięciem w obie strony, nie zmieniając sieci.
---

# Sprawdź przesunięciem

Napisz funkcję `nudged_slope(km, turned_down, net, name)`, która liczy nachylenie kary jednego zamówienia względem parametru o nazwie `name`, na przykład `"w1"`, przesunięciem w obie strony, tak jak w części [Sprawdzanie przesunięciem](../../../../../notes/04-foundations/04-neural-networks/02-backpropagation.pl.md#sprawdzanie-przesunięciem): kara z parametrem większym o 0,001 minus kara z parametrem mniejszym o 0,001, podzielone przez odległość między tymi dwiema wartościami, 0,002. Funkcje `penalty(km, turned_down, net)`, `predict` i `sigmoid` są gotowe.

`nudged_slope` nie może zmieniać `net`: kod, który ją wywołuje, może jeszcze potrzebować sieci w pierwotnej postaci.

| Wywołanie                        | Zwraca                                                               |
| -------------------------------- | -------------------------------------------------------------------- |
| `nudged_slope(3, 1, NET, "w1")`  | około `-2.193`                                                       |
| `nudged_slope(3, 1, NET, "v1")`  | około `-0.366`                                                       |
| `nudged_slope(12, 1, NET, "w2")` | około `-1.875`                                                       |
| `nudged_slope(11, 0, NET, "b2")` | około `0.269`                                                        |
| `NET` po powyższych wywołaniach  | `{"w1": -2, "b1": 6, "w2": 2, "b2": -22, "v1": 4, "v2": 4, "c": -3}` |

Tabela zaokrągla liczby do 3 miejsc po przecinku, ale sprawdzenia tego nie robią. Przesunięcie daje prawie to samo nachylenie co propagacja wsteczna, ale nie dokładnie: dla `"w1"` przy 3 km daje −2,19317, a propagacja wsteczna −2,19318. Sprawdzenia oczekują wyniku przesunięcia, więc przesuwaj dokładnie o 0,001.

Jeśli nachylenia wychodzą dwa razy większe niż w tabeli, różnica jest dzielona przez 0,001, a dwie wartości parametru dzieli 0,002. Jeśli trzecie wywołanie daje około `-1.864` albo `-1.887`, przesunięcie idzie tylko w jedną stronę. Jeśli `NET` zmienia się po wywołaniach, `nudged_slope` zmienia słownik, który dostała: pracuj na kopiach zrobionych przez `dict(net)`.
