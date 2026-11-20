---
description: Napisz FGSM dla dowolnej sieci i dowolnej porcji obrazów, z jednym krokiem o ε zgodnie ze znakiem nachylenia i pikselami w dozwolonym zakresie.
---

# Jeden krok FGSM

W części [Jeden krok zgodnie ze znakiem](../../../../notes/07-adversarial-examples/01-fooling-a-network.pl.md#jeden-krok-zgodnie-ze-znakiem) FGSM oszukało sieć rozpoznającą cyfry. Napisz ten atak jako funkcję, która działa dla każdej sieci:

- `fgsm(model, X, y, epsilon)` zwraca obrazy z `X` po ataku: każdy piksel przesunięty o `epsilon` w stronę znaku swojego nachylenia, a następnie przycięty do przedziału od 0 do 1. Chodzi o nachylenia straty `criterion(model(X), y)` względem obrazów.

`X` to porcja obrazów o kształcie `[obrazy, 1, wysokość, szerokość]`, a `y` zawiera klasę każdego z nich. Funkcja zwraca same liczby, czyli tensor, który nie wymaga gradientu, i nie zmienia niczego, co dostała: nie oznacza `X` i niczego nie zapisuje w `.grad` parametrów modelu.

Obrazy mają tu po 2×2 piksele, żeby atak dało się sprawdzić ręcznie. Gotowa funkcja `darkest_pixel()` tworzy sieć, która wskazuje najciemniejszy z czterech pikseli obrazu: jej cztery logity to cztery piksele pomnożone przez 4. Żeby sieć była mniej pewna wskazanego piksela, ten musi się rozjaśnić, a pozostałe trzy przyciemnić:

| `X`, jeden obraz             | `y` | `epsilon` | `fgsm` zwraca               |
| ---------------------------- | --- | --------- | --------------------------- |
| `[[0.9, 0.2], [0.4, 0.1]]`   | `0` | `0.1`     | `[[0.8, 0.3], [0.5, 0.2]]`  |
| `[[0.9, 0.2], [0.4, 0.1]]`   | `0` | `0.3`     | `[[0.6, 0.5], [0.7, 0.4]]`  |
| `[[0.3, 0.95], [1.0, 0.5]]`  | `2` | `0.1`     | `[[0.4, 1.0], [0.9, 0.6]]`  |
| `[[0.05, 0.0], [0.02, 0.0]]` | `0` | `0.1`     | `[[0.0, 0.1], [0.12, 0.1]]` |
| `[[0.9, 0.2], [0.4, 0.1]]`   | `0` | `0.0`     | `[[0.9, 0.2], [0.4, 0.1]]`  |

Przy ε = 0,3, w drugim wierszu, najciemniejszy staje się trzeci piksel i sieć się myli. W trzecim wierszu piksel 0,95 zatrzymuje się na 1, a w czwartym piksel 0,05 na 0. Sprawdzenia korzystają też z `small_network()`, sieci z warstwą ukrytą i losowymi wagami, której nachyleń nie da się odgadnąć, oraz z porcji trzech obrazów, każdego z własną etykietą.

Jedno sprawdzenie bada, co zostało po wywołaniu: `requires_grad` wyniku, `requires_grad` tensora `X`, `.grad` każdego parametru i `requires_grad` każdego parametru. Powinno to być `[False, False, [None, None], [True, True]]`:

- Jeśli wynik wymaga gradientu, nadal jest częścią obliczeń, które go utworzyły: `detach()` zwraca same liczby.
- Jeśli `X.requires_grad` to `True`, funkcja oznaczyła tensor, który dostała, a nie jego kopię: kopię tworzy `X.clone()`.
- Jeśli zamiast dwóch `None` są tensory, nachylenia policzyło `backward()`, które wypełnia `.grad` wszystkiego, co jest oznaczone. `torch.autograd.grad` zwraca tylko to nachylenie, o które się je poprosi.
- Jeśli `requires_grad` któregoś parametru to `False`, funkcja zamroziła model i tak go zostawiła, więc nie da się go już trenować.
