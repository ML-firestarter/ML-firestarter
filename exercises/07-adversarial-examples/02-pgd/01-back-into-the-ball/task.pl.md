---
description: Napisz rzutowanie z PGD, które sprowadza obraz z powrotem do kuli o promieniu ε wokół obrazu początkowego, z pikselami w przedziale od 0 do 1.
---

# Z powrotem do kuli

Po każdym kroku PGD sprowadza obraz [z powrotem do kuli](../../../../notes/07-adversarial-examples/02-pgd.pl.md#z-powrotem-do-kuli). Napisz funkcję, która to robi:

- `project(X_adv, X, epsilon)` zwraca obrazy z `X_adv`, każdy sprowadzony do kuli o promieniu ε wokół odpowiadającego mu obrazu z `X`: żaden piksel nie różni się od tego samego piksela w `X` o więcej niż `epsilon`, a każdy mieści się między 0 a 1. Piksel, który był już w kuli i w dozwolonym zakresie, zostaje bez zmian.

`X_adv` i `X` to porcje o tym samym kształcie. Funkcja zwraca nowy tensor i nie zmienia żadnego z nich.

| `X`, jeden obraz             | `X_adv`                       | `epsilon` | `project` zwraca             |
| ---------------------------- | ----------------------------- | --------- | ---------------------------- |
| `[[0.5, 0.5], [0.5, 0.5]]`   | `[[0.75, 0.42], [0.5, 0.2]]`  | `0.1`     | `[[0.6, 0.42], [0.5, 0.4]]`  |
| `[[0.5, 0.5], [0.5, 0.5]]`   | `[[0.75, 0.42], [0.5, 0.2]]`  | `0.3`     | `[[0.75, 0.42], [0.5, 0.2]]` |
| `[[0.5, 0.5], [0.5, 0.5]]`   | `[[0.75, 0.42], [0.5, 0.2]]`  | `0.0`     | `[[0.5, 0.5], [0.5, 0.5]]`   |
| `[[0.97, 0.02], [0.0, 1.0]]` | `[[1.3, -0.2], [0.04, 0.96]]` | `0.1`     | `[[1.0, 0.0], [0.04, 0.96]]` |
| `[[0.97, 0.02], [0.0, 1.0]]` | `[[0.8, 0.2], [0.3, 0.7]]`    | `0.1`     | `[[0.87, 0.12], [0.1, 0.9]]` |

W pierwszym wierszu piksel 0,75 jest o 0,25 powyżej swojej wartości 0,5 i wraca na 0,1 powyżej niej, piksel 0,2 jest o 0,3 poniżej i wraca na 0,1 poniżej, a dwa środkowe piksele mieściły się w kuli. Przy ε = 0,3 cały obraz mieści się w kuli i nic się nie zmienia. Przy ε = 0 kula zawiera tylko sam obraz `X`.

W czwartym wierszu kula pozwoliłaby pierwszemu pikselowi dojść do 1,07, a drugiemu zejść do −0,08, ale piksele nie mogą mieć takich wartości: zatrzymują się na 1 i na 0.

Kod startowy przycina piksele do przedziału od 0 do 1, ale w ogóle nie bierze pod uwagę `X`. Kula jest zbudowana wokół wartości każdego piksela w `X`, więc każdy piksel ma inne granice: to różnice `X_adv - X` muszą się zmieścić między `-epsilon` a `epsilon`.
