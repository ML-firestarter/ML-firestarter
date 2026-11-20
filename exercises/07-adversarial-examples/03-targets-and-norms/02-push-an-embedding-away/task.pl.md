---
description: Napisz atak, który nie potrzebuje etykiet. Odsuwa embedding obrazu jak najdalej od pierwotnego położenia, zaczynając od losowego obrazu z kuli o promieniu ε.
---

# Odsuń embedding

W części [Atak na embedding](../../../../notes/07-adversarial-examples/03-targets-and-norms.pl.md#atak-na-embedding) embedding obrazu oddalił się od pierwotnego położenia bez użycia żadnej etykiety. Napisz ten atak dla dowolnej sieci, która tworzy embeddingi obrazów:

- `push_away(embed, X, noise, epsilon, alpha, steps)` zaczyna od `X + epsilon * noise`, zrzutowanego do kuli o promieniu ε wokół `X`, i wykonuje `steps` kroków. W każdym kroku liczy nachylenia kwadratu odległości między `embed(X_adv)` a `embed(X)`, zsumowanego po całej porcji, względem obrazów w ich bieżącym stanie. Przesuwa każdy piksel o `alpha` w stronę, w którą odległość rośnie, i rzutuje wynik do kuli. Zwraca obrazy po ostatnim kroku.

`noise` to tensor o kształcie `X` z liczbami od −1 do 1, czyli losowy punkt startowy. Podaje go ten, kto wywołuje funkcję, dzięki czemu sprawdzenia wiedzą, jakiego wyniku się spodziewać. Funkcja `project` jest gotowa. Jak poprzednio, funkcja zwraca tensor, który nie wymaga gradientu, nie oznacza `X` i niczego nie zapisuje w `.grad` parametrów `embed`.

`rows_and_columns()` tworzy sieć, której embedding obrazu 2×2 to dwie liczby: o ile górny wiersz jest ciemniejszy od dolnego i o ile lewa kolumna jest ciemniejsza od prawej. Jednolicie szary obraz ma embedding `[0, 0]`:

| `X`, jeden obraz           | `noise`                     | `epsilon` | `alpha` | `steps` | `push_away` zwraca           | Jego embedding |
| -------------------------- | --------------------------- | --------- | ------- | ------- | ---------------------------- | -------------- |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[1.0, 0.5], [0.0, -1.0]]` | `0.1`     | `0.04`  | `0`     | `[[0.6, 0.55], [0.5, 0.4]]`  | `[0.25, 0.15]` |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[1.0, 0.5], [0.0, -1.0]]` | `0.1`     | `0.04`  | `1`     | `[[0.6, 0.59], [0.46, 0.4]]` | `[0.33, 0.07]` |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[1.0, 0.5], [0.0, -1.0]]` | `0.1`     | `0.04`  | `3`     | `[[0.6, 0.6], [0.4, 0.4]]`   | `[0.4, 0.0]`   |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[-1.0, 0.5], [0.0, 0.2]]` | `0.1`     | `0.04`  | `10`    | `[[0.4, 0.6], [0.4, 0.6]]`   | `[0.0, -0.4]`  |
| `[[0.5, 0.5], [0.5, 0.5]]` | `[[0.0, 0.0], [0.0, 0.0]]`  | `0.1`     | `0.04`  | `10`    | `[[0.5, 0.5], [0.5, 0.5]]`   | `[0.0, 0.0]`   |

Pierwszy szum lekko przyciemnia górny wiersz względem dolnego, a atak idzie dalej w tę stronę, aż zatrzyma go granica kuli: górny wiersz jest w końcu o 0,1 ciemniejszy, a dolny o 0,1 jaśniejszy, czyli różnią się tak bardzo, jak tylko mogą. Drugi szum na starcie przyciemnia prawą kolumnę i w tę stronę idzie atak. O kierunku ataku decyduje punkt startowy.

Bez szumu, w ostatnim wierszu, atak nie rusza się z miejsca. W punkcie wyjścia odległość wynosi 0, wszystkie nachylenia są zerowe, a więc także ich znaki.

Kod startowy tylko ustawia punkt startowy i na tym się kończy. Sprawdzenia korzystają też z `small_embedder()`, sieci z ReLU, której nachylenia zmieniają się wraz z obrazami.
