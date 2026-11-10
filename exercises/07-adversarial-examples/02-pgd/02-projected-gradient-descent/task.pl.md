---
description: Napisz PGD dla dowolnej sieci, z małymi krokami zgodnie ze znakiem nachylenia i rzutem z powrotem do kuli ε po każdym z nich.
---

# Rzutowany spadek gradientu

Napisz [PGD](../../../../notes/07-adversarial-examples/02-pgd.pl.md#rzutowany-spadek-gradientu) jako funkcję, która działa dla każdej sieci:

- `pgd(model, X, y, epsilon, alpha, steps)` zaczyna od obrazów `X` i robi `steps` kroków. Każdy krok bierze nachylenia straty, `criterion(model(X_adv), y)`, względem obrazów takich, jakie są w tym momencie, przesuwa każdy piksel o `alpha` w kierunku znaku jego nachylenia i rzutuje wynik do kuli ε wokół `X`. Zwraca obrazy po ostatnim kroku.

`project` jest już napisane. Jak w ćwiczeniu [Jeden krok FGSM](../../01-fooling-a-network/01-one-step-with-fgsm/task.pl.md), funkcja zwraca tensor, który nie wymaga gradientu, i nie zostawia żadnego oznaczenia na `X` ani niczego w `.grad` parametrów modelu.

`darkest_pixel()` robi sieć, która mówi, który z czterech pikseli obrazu 2×2 jest najciemniejszy. Każdy krok odejmuje `alpha` od piksela z etykiety i dodaje `alpha` do pozostałych trzech, dopóki nie zatrzyma ich kula:

| `X`, jeden obraz           | `y` | `epsilon` | `alpha` | `steps` | `pgd` zwraca                   |
| -------------------------- | --- | --------- | ------- | ------- | ------------------------------ |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `1`     | `[[0.86, 0.24], [0.44, 0.14]]` |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `2`     | `[[0.82, 0.28], [0.48, 0.18]]` |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `3`     | `[[0.8, 0.3], [0.5, 0.2]]`     |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `10`    | `[[0.8, 0.3], [0.5, 0.2]]`     |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.3`     | `0.1`   | `5`     | `[[0.6, 0.5], [0.7, 0.4]]`     |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `0`     | `[[0.9, 0.2], [0.4, 0.1]]`     |

Trzeci krok zaniósłby piksele 0,12 od miejsca, z którego wyszły, a rzut sprowadza je z powrotem na 0,1. Od tej chwili kolejne kroki niczego nie zmieniają.

Kod, od którego zaczynasz, robi jeden krok, cokolwiek mówi `steps`. Sprawdzenia używają też `small_network()`, sieci z warstwą ukrytą, której nachylenia zmieniają się, gdy obrazy się przesuwają, więc nachylenia trzeba brać od nowa w każdym kroku, przy obrazach takich, jakie są wtedy, a nie raz przy `X`.

Jedno sprawdzenie patrzy na to, co twoja funkcja pokazuje sieci: żaden obraz, z którym wywoływany jest model, nie może leżeć poza kulą. Rzut przychodzi więc po każdym kroku, a nie raz na końcu.
