---
description: Napisz atak, który nie potrzebuje etykiet. Przesuwa embedding obrazu jak najdalej od miejsca, w którym był, zaczynając od losowego obrazu w kuli ε.
---

# Odepchnij embedding

W części [Atak na embedding](../../../../notes/07-adversarial-examples/03-targets-and-norms.pl.md#atak-na-embedding) embedding obrazu odsunął się od miejsca, w którym był, bez żadnej etykiety. Napisz ten atak dla dowolnej sieci, która robi embeddingi obrazów:

- `push_away(embed, X, noise, epsilon, alpha, steps)` zaczyna od `X + epsilon * noise`, zrzutowanego do kuli ε wokół `X`, i robi `steps` kroków. Każdy krok bierze nachylenia kwadratu odległości między `embed(X_adv)` a `embed(X)`, zsumowanego po porcji, względem obrazów takich, jakie są w tym momencie. Przesuwa każdy piksel o `alpha` w kierunku, w którym odległość rośnie, i rzutuje wynik do kuli. Zwraca obrazy po ostatnim kroku.

`noise` to tensor o kształcie `X`, z liczbami od −1 do 1: losowy start, który podaje ten, kto wywołuje funkcję, żeby sprawdzenia wiedziały, czego się spodziewać. `project` jest już napisane. Jak wcześniej, funkcja zwraca tensor, który nie wymaga gradientu, i nie zostawia żadnego oznaczenia na `X` ani niczego w `.grad` parametrów `embed`.

`rows_and_columns()` robi sieć, której embedding obrazu 2×2 to dwie liczby: o ile górny wiersz jest ciemniejszy od dolnego i o ile lewa kolumna jest ciemniejsza od prawej. Równo szary obraz ma embedding `[0, 0]`:

| `X`, jeden obraz           | `noise`                     | `epsilon` | `alpha` | `steps` | `push_away` zwraca           | Jego embedding |
| -------------------------- | --------------------------- | --------- | ------- | ------- | ---------------------------- | -------------- |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[1.0, 0.5], [0.0, -1.0]]` | `0.1`     | `0.04`  | `0`     | `[[0.6, 0.55], [0.5, 0.4]]`  | `[0.25, 0.15]` |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[1.0, 0.5], [0.0, -1.0]]` | `0.1`     | `0.04`  | `1`     | `[[0.6, 0.59], [0.46, 0.4]]` | `[0.33, 0.07]` |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[1.0, 0.5], [0.0, -1.0]]` | `0.1`     | `0.04`  | `3`     | `[[0.6, 0.6], [0.4, 0.4]]`   | `[0.4, 0.0]`   |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[-1.0, 0.5], [0.0, 0.2]]` | `0.1`     | `0.04`  | `10`    | `[[0.4, 0.6], [0.4, 0.6]]`   | `[0.0, -0.4]`  |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[0.0, 0.0], [0.0, 0.0]]`  | `0.1`     | `0.04`  | `10`    | `[[0.5, 0.5], [0.5, 0.5]]`   | `[0.0, 0.0]`   |

Pierwszy szum robi górny wiersz trochę ciemniejszym od dolnego, a atak idzie dalej w tę stronę, dopóki nie zatrzyma go kula: górny wiersz kończy 0,1 ciemniejszy, a dolny 0,1 jaśniejszy, czyli tak daleko od siebie, jak tylko mogą być. Drugi szum rusza w stronę ciemniejszej prawej kolumny i tam kończy się jego atak. To start decyduje, dokąd pójdzie atak.

Bez żadnego szumu, w ostatnim wierszu, atak nigdy nie opuszcza obrazu. Przy samym obrazie odległość wynosi 0, każde nachylenie to 0 i znak każdego nachylenia też.

Kod, od którego zaczynasz, robi start i na tym się zatrzymuje. Sprawdzenia używają też `small_embedder()`, sieci z ReLU, której nachylenia zmieniają się, gdy obrazy się przesuwają.
