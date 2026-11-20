---
description: Napisz ukierunkowane PGD, które zmienia obrazy tak, żeby sieć rozpoznała klasę wybraną przez atakującego.
---

# Wyceluj w klasę

W części [Atak ukierunkowany](../../../../notes/07-adversarial-examples/03-targets-and-norms.pl.md#atak-ukierunkowany) sieć rozpoznała jedynkę jako siódemkę. Napisz ten atak dla dowolnej sieci:

- `targeted_pgd(model, X, target, epsilon, alpha, steps)` zaczyna od obrazów `X` i wykonuje `steps` kroków. W każdym kroku liczy nachylenia straty dla klas docelowych, `criterion(model(X_adv), target)`, względem obrazów w ich bieżącym stanie, przesuwa każdy piksel o `alpha` w stronę, w którą ta strata maleje, i rzutuje wynik do kuli o promieniu ε wokół `X`. Zwraca obrazy po ostatnim kroku.

`target` zawiera klasę, którą atakujący chce uzyskać dla każdego obrazu. Funkcja `project` jest gotowa. Jak poprzednio, funkcja zwraca tensor, który nie wymaga gradientu, nie oznacza `X` i niczego nie zapisuje w `.grad` parametrów modelu.

`darkest_pixel()` tworzy sieć, która wskazuje najciemniejszy z czterech pikseli obrazu 2×2. Żeby wskazała wybrany piksel, ten musi się przyciemnić, a pozostałe trzy rozjaśnić:

| `X`, jeden obraz           | `target` | `epsilon` | `alpha` | `steps` | `targeted_pgd` zwraca          | Sieć wskazuje |
| -------------------------- | -------- | --------- | ------- | ------- | ------------------------------ | ------------- |
| `[[0.9, 0.2], [0.4, 0.1]]` | `2`      | `0.1`     | `0.04`  | `1`     | `[[0.86, 0.16], [0.44, 0.06]]` | `0`           |
| `[[0.9, 0.2], [0.4, 0.1]]` | `2`      | `0.1`     | `0.04`  | `3`     | `[[0.8, 0.1], [0.5, 0.0]]`     | `0`           |
| `[[0.9, 0.2], [0.4, 0.1]]` | `2`      | `0.3`     | `0.1`   | `5`     | `[[0.6, 0.0], [0.7, 0.0]]`     | `2`           |
| `[[0.9, 0.2], [0.4, 0.1]]` | `3`      | `0.5`     | `0.1`   | `6`     | `[[0.4, 0.0], [0.0, 0.6]]`     | `3`           |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0`      | `0.1`     | `0.04`  | `3`     | `[[1.0, 0.1], [0.3, 0.0]]`     | `0`           |

W trzech pierwszych wierszach celem jest piksel 2, ten o wartości 0,4. Przy ε = 0,1 atak nie wyniesie go ponad piksel 0, który spada z 0,9 tylko do 0,8, więc sieć dalej wskazuje 0. Przy ε = 0,3 oba piksele się mijają i sieć wskazuje 2. Najtrudniejszym celem jest piksel 3, najjaśniejszy z czterech, o wartości 0,1. Atak trafia w niego przy ε = 0,5, a wystarczyłoby każde ε większe od 0,4: piksele 0 i 3 dzieli na początku 0,8, a każdy z nich przesuwa się o ε.

W ostatnim wierszu celem jest piksel, który sieć już wskazuje, a atak tylko zwiększa jej pewność.

Kod startowy zwraca obrazy bez zmian. Sprawdzenia korzystają też z `small_network()`, sieci z warstwą ukrytą, której nachylenia zmieniają się wraz z obrazami, a jedno z nich śledzi, co twoja funkcja podaje sieci: model nie może dostać żadnego obrazu spoza kuli.
