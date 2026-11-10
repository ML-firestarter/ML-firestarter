---
description: Napisz ukierunkowane PGD, które zmienia obrazy tak, żeby sieć czytała klasę wybraną przez atakującego.
---

# Wyceluj w klasę

W części [W stronę klasy](../../../../notes/07-adversarial-examples/03-targets-and-norms.pl.md#w-stronę-klasy) sieć przeczytała 1 jako 7. Napisz ten atak dla dowolnej sieci:

- `targeted_pgd(model, X, target, epsilon, alpha, steps)` zaczyna od obrazów `X` i robi `steps` kroków. Każdy krok bierze nachylenia straty dla celów, `criterion(model(X_adv), target)`, względem obrazów takich, jakie są w tym momencie, przesuwa każdy piksel o `alpha` w kierunku, w którym ta strata maleje, i rzutuje wynik do kuli ε wokół `X`. Zwraca obrazy po ostatnim kroku.

`target` ma klasę, której atakujący chce dla każdego obrazu. `project` jest już napisane. Jak wcześniej, funkcja zwraca tensor, który nie wymaga gradientu, i nie zostawia żadnego oznaczenia na `X` ani niczego w `.grad` parametrów modelu.

`darkest_pixel()` robi sieć, która mówi, który z czterech pikseli obrazu 2×2 jest najciemniejszy. Żeby wskazała wybrany piksel, ten piksel musi się przyciemnić, a pozostałe trzy rozjaśnić:

| `X`, jeden obraz           | `target` | `epsilon` | `alpha` | `steps` | `targeted_pgd` zwraca          | Sieć czyta |
| -------------------------- | -------- | --------- | ------- | ------- | ------------------------------ | ---------- |
| `[[0.9, 0.2], [0.4, 0.1]]` | `2`      | `0.1`     | `0.04`  | `1`     | `[[0.86, 0.16], [0.44, 0.06]]` | `0`        |
| `[[0.9, 0.2], [0.4, 0.1]]` | `2`      | `0.1`     | `0.04`  | `3`     | `[[0.8, 0.1], [0.5, 0.0]]`     | `0`        |
| `[[0.9, 0.2], [0.4, 0.1]]` | `2`      | `0.3`     | `0.1`   | `5`     | `[[0.6, 0.0], [0.7, 0.0]]`     | `2`        |
| `[[0.9, 0.2], [0.4, 0.1]]` | `3`      | `0.5`     | `0.1`   | `6`     | `[[0.4, 0.0], [0.0, 0.6]]`     | `3`        |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0`      | `0.1`     | `0.04`  | `3`     | `[[1.0, 0.1], [0.3, 0.0]]`     | `0`        |

Celem pierwszych trzech wierszy jest piksel 2, ten równy 0,4. Przy ε = 0,1 atak nie wyprowadzi go ponad 0,9 piksela 0, który schodzi tylko do 0,8, i sieć dalej czyta 0. Przy ε = 0,3 oba piksele się mijają i sieć czyta 2. Najtrudniejszy cel to piksel 3, najjaśniejszy z czterech, równy 0,1. Udaje się go osiągnąć przy ε = 0,5, a wystarczyłoby każde ε powyżej 0,4: oba piksele zaczynają 0,8 od siebie, a każdy przesuwa się o ε.

W ostatnim wierszu celem jest to, co sieć już czyta, i atak sprawia, że jest tego pewniejsza.

Kod, od którego zaczynasz, zwraca obrazy takie, jakie są. Sprawdzenia używają też `small_network()`, sieci z warstwą ukrytą, której nachylenia zmieniają się, gdy obrazy się przesuwają, a jedno sprawdzenie patrzy na to, co twoja funkcja pokazuje sieci: żaden obraz, z którym wywoływany jest model, nie może leżeć poza kulą.
