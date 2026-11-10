---
description: Napisz rzut z PGD, który sprowadza obraz z powrotem do kuli ε wokół obrazu, od którego wyszedł, tak żeby każdy piksel został między 0 a 1.
---

# Z powrotem do kuli

Po każdym ze swoich kroków PGD sprowadza obraz [z powrotem do kuli](../../../../notes/07-adversarial-examples/02-pgd.pl.md#z-powrotem-do-kuli). Napisz funkcję, która to robi:

- `project(X_adv, X, epsilon)` zwraca obrazy z `X_adv`, każdy sprowadzony z powrotem do kuli ε wokół swojego obrazu z `X`: żaden piksel nie jest o więcej niż `epsilon` powyżej ani poniżej tego samego piksela z `X`, a każdy piksel jest między 0 a 1. Piksel, który był już w kuli i był poprawny, zostaje tam, gdzie jest.

`X_adv` i `X` to porcje o tym samym kształcie, a funkcja zwraca nowy tensor, nie zmieniając żadnego z nich.

| `X`, jeden obraz             | `X_adv`                       | `epsilon` | `project` zwraca             |
| ---------------------------- | ----------------------------- | --------- | ---------------------------- |
| `[[0.5, 0.5], [0.5, 0.5]]`   | `[[0.75, 0.42], [0.5, 0.2]]`  | `0.1`     | `[[0.6, 0.42], [0.5, 0.4]]`  |
| `[[0.5, 0.5], [0.5, 0.5]]`   | `[[0.75, 0.42], [0.5, 0.2]]`  | `0.3`     | `[[0.75, 0.42], [0.5, 0.2]]` |
| `[[0.5, 0.5], [0.5, 0.5]]`   | `[[0.75, 0.42], [0.5, 0.2]]`  | `0.0`     | `[[0.5, 0.5], [0.5, 0.5]]`   |
| `[[0.97, 0.02], [0.0, 1.0]]` | `[[1.3, -0.2], [0.04, 0.96]]` | `0.1`     | `[[1.0, 0.0], [0.04, 0.96]]` |
| `[[0.97, 0.02], [0.0, 1.0]]` | `[[0.8, 0.2], [0.3, 0.7]]`    | `0.1`     | `[[0.87, 0.12], [0.1, 0.9]]` |

W pierwszym wierszu 0,75 jest 0,25 powyżej swojego 0,5 i wraca na 0,1 powyżej, 0,2 jest 0,3 poniżej i wraca na 0,1 poniżej, a dwa piksele pomiędzy były w kuli. Przy ε = 0,3 cały obraz jest w kuli i nic się nie rusza. Przy ε = 0 kula mieści tylko sam `X`.

W czwartym wierszu kula pozwoliłaby pierwszemu pikselowi dojść do 1,07, a drugiemu zejść do −0,08, a żadna z tych wartości nie jest pikselem: zatrzymują się na 1 i na 0.

Kod, od którego zaczynasz, trzyma piksele między 0 a 1 i nigdy nie patrzy na `X`. Kula jest wokół wartości, jaką każdy piksel ma w `X`, więc granice są dla każdego piksela inne: to różnice, `X_adv - X`, muszą skończyć między `-epsilon` a `epsilon`.
