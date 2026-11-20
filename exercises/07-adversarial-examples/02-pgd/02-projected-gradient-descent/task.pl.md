---
description: Napisz PGD dla dowolnej sieci, z małymi krokami zgodnie ze znakiem nachylenia i rzutowaniem z powrotem do kuli o promieniu ε po każdym z nich.
---

# Rzutowany spadek gradientu

Napisz [PGD](../../../../notes/07-adversarial-examples/02-pgd.pl.md#rzutowany-spadek-gradientu) jako funkcję, która działa dla każdej sieci:

- `pgd(model, X, y, epsilon, alpha, steps)` zaczyna od obrazów `X` i wykonuje `steps` kroków. W każdym kroku liczy nachylenia straty `criterion(model(X_adv), y)` względem obrazów w ich bieżącym stanie, przesuwa każdy piksel o `alpha` w stronę znaku jego nachylenia i rzutuje wynik do kuli o promieniu ε wokół `X`. Zwraca obrazy po ostatnim kroku.

Funkcja `project` jest gotowa. Tak jak w ćwiczeniu [Jeden krok FGSM](../../01-fooling-a-network/01-one-step-with-fgsm/task.pl.md), `pgd` zwraca tensor, który nie wymaga gradientu, nie oznacza `X` i niczego nie zapisuje w `.grad` parametrów modelu.

`darkest_pixel()` tworzy sieć, która wskazuje najciemniejszy z czterech pikseli obrazu 2×2. Każdy krok odejmuje `alpha` od piksela wskazanego przez etykietę i dodaje `alpha` do pozostałych trzech, dopóki nie zatrzyma ich granica kuli:

| `X`, jeden obraz           | `y` | `epsilon` | `alpha` | `steps` | `pgd` zwraca                   |
| -------------------------- | --- | --------- | ------- | ------- | ------------------------------ |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `1`     | `[[0.86, 0.24], [0.44, 0.14]]` |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `2`     | `[[0.82, 0.28], [0.48, 0.18]]` |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `3`     | `[[0.8, 0.3], [0.5, 0.2]]`     |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `10`    | `[[0.8, 0.3], [0.5, 0.2]]`     |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.3`     | `0.1`   | `5`     | `[[0.6, 0.5], [0.7, 0.4]]`     |
| `[[0.9, 0.2], [0.4, 0.1]]` | `0` | `0.1`     | `0.04`  | `0`     | `[[0.9, 0.2], [0.4, 0.1]]`     |

Trzeci krok oddaliłby piksele o 0,12 od wartości początkowych, więc rzutowanie sprowadza je z powrotem na 0,1. Od tej chwili kolejne kroki niczego już nie zmieniają.

Kod startowy robi jeden krok, niezależnie od wartości `steps`. Sprawdzenia korzystają też z `small_network()`, sieci z warstwą ukrytą, której nachylenia zmieniają się wraz z obrazami, więc nachylenia trzeba liczyć od nowa w każdym kroku, dla bieżących obrazów, a nie raz dla `X`.

Jedno sprawdzenie śledzi, co twoja funkcja podaje sieci: model nie może dostać żadnego obrazu spoza kuli. Rzutowanie musi więc następować po każdym kroku, a nie raz na końcu.
