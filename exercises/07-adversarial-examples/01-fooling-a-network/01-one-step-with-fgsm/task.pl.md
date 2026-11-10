---
description: Napisz FGSM dla dowolnej sieci i dowolnej porcji obrazów, z jednym krokiem o ε zgodnie ze znakiem nachylenia i pikselami, które zostają poprawne.
---

# Jeden krok FGSM

Część [Jeden krok zgodnie ze znakiem](../../../../notes/07-adversarial-examples/01-fooling-a-network.pl.md#jeden-krok-zgodnie-ze-znakiem) oszukała sieć, która czyta cyfry. Napisz ten atak jako funkcję, która działa dla każdej sieci:

- `fgsm(model, X, y, epsilon)` zwraca obrazy z `X` po ataku: każdy piksel przesunięty o `epsilon` w kierunku znaku swojego nachylenia, a potem przycięty tak, żeby został między 0 a 1. Nachylenia to nachylenia straty, `criterion(model(X), y)`, względem obrazów.

`X` to porcja obrazów o kształcie `[obrazy, 1, wysokość, szerokość]`, a `y` ma klasę każdego z nich. Funkcja zwraca same liczby, tensor, który nie wymaga gradientu. Zostawia to, co dostała, tak, jak to zastała: żadnego oznaczenia na `X` i nic w `.grad` parametrów modelu.

Obrazy mają tu po 2×2 piksele, żeby dało się sprawdzić atak ręcznie. `darkest_pixel()`, które jest już napisane, robi sieć, która mówi, który z czterech pikseli obrazu jest najciemniejszy: jej cztery logity to cztery piksele, każdy razy 4. Żeby była mniej pewna jakiegoś piksela, ten piksel musi się rozjaśnić, a pozostałe trzy przyciemnić:

| `X`, jeden obraz             | `y` | `epsilon` | `fgsm` zwraca               |
| ---------------------------- | --- | --------- | --------------------------- |
| `[[0.9, 0.2], [0.4, 0.1]]`   | `0` | `0.1`     | `[[0.8, 0.3], [0.5, 0.2]]`  |
| `[[0.9, 0.2], [0.4, 0.1]]`   | `0` | `0.3`     | `[[0.6, 0.5], [0.7, 0.4]]`  |
| `[[0.3, 0.95], [1.0, 0.5]]`  | `2` | `0.1`     | `[[0.4, 1.0], [0.9, 0.6]]`  |
| `[[0.05, 0.0], [0.02, 0.0]]` | `0` | `0.1`     | `[[0.0, 0.1], [0.12, 0.1]]` |
| `[[0.9, 0.2], [0.4, 0.1]]`   | `0` | `0.0`     | `[[0.9, 0.2], [0.4, 0.1]]`  |

Przy ε = 0,3, w drugim wierszu, najciemniejszy okazuje się trzeci piksel i sieć czyta obraz źle. W trzecim wierszu piksel 0,95 zatrzymuje się na 1, a w czwartym piksel 0,05 zatrzymuje się na 0. Sprawdzenia używają też `small_network()`, sieci z warstwą ukrytą i losowymi wagami, której nachyleń nie da się zgadnąć, i porcji trzech obrazów, każdy z własną etykietą.

Jedno sprawdzenie patrzy na to, co zostało po wywołaniu: `requires_grad` wyniku, `requires_grad` tensora `X`, `.grad` każdego parametru i `requires_grad` każdego parametru. Powinno to być `[False, False, [None, None], [True, True]]`:

- Jeśli wynik wymaga gradientu, nadal jest częścią obliczenia, które go zrobiło: `detach()` daje same jego liczby.
- Jeśli `X.requires_grad` to `True`, funkcja oznaczyła tensor, który dostała, a nie jego kopię: `X.clone()` to kopia.
- Jeśli tam, gdzie powinny być dwa `None`, są tensory, nachylenia policzyło `backward()`, które wypełnia `.grad` wszystkiego, co jest oznaczone. `torch.autograd.grad` zwraca tylko to nachylenie, o które je zapytano.
- Jeśli `requires_grad` któregoś parametru to `False`, funkcja zamroziła model i zostawiła go zamrożonego, a jego właściciel nie może go już trenować.
