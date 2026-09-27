---
description: Napisz neuron z dowolną liczbą wejść i predykcję sieci o dowolnych 7 parametrach.
---

# Przejście w przód

W części [Neurony, warstwy i sieci](../../../../../notes/04-foundations/04-neural-networks/01-layers.pl.md#neurony-warstwy-i-sieci) funkcja `predict(km, net)` rozpisywała każdy z trzech neuronów sieci w osobnym wierszu. Ale każdy neuron robi to samo: mnoży każde ze swoich wejść przez wagę, dodaje wyraz wolny i przepuszcza wynik przez sigmoidę. Dokończ dwie funkcje:

- `neuron(inputs, weights, bias)` zwraca aktywację neuronu z sigmoidą jako funkcją aktywacji. `inputs` to lista jego wejść, a `weights` lista jego wag, po jednej dla każdego wejścia, w tej samej kolejności.
- `predict(km, net)` zwraca prawdopodobieństwo, że zamówienie na kurs długości `km` km zostanie odrzucone, według sieci, której 7 parametrów zawiera słownik `net`, pod tymi samymi nazwami co w lekcji. Może trzy razy wywołać `neuron`, raz dla każdego neuronu.

`sigmoid` jest gotowa, a `NET` zawiera 7 parametrów z lekcji.

| Wywołanie                             | Zwraca        |
| ------------------------------------- | ------------- |
| `neuron([3], [-2], 6)`                | `0.5`         |
| `neuron([2], [-2], 6)`                | około `0.881` |
| `neuron([0.5, 0.0], [4, 4], -3)`      | około `0.269` |
| `neuron([1, 2, 3], [0.5, -1, 2], -3)` | około `0.818` |
| `predict(3, NET)`                     | około `0.269` |
| `predict(14, NET)`                    | około `0.729` |

Tabela zaokrągla liczby do 3 miejsc po przecinku, ale sprawdzenia tego nie robią. Trzecie wywołanie to neuron wyjściowy sieci z lekcji dla kursu na 3 km, gdzie `h1` wynosi 0,5, a `h2` praktycznie 0, dlatego `predict(3, NET)` daje prawie to samo. Sprawdzenia próbują też innych parametrów, więc `predict` musi brać je z `net`.

Jeśli `predict` zgłasza `TypeError`, sprawdź, czy przekazuje do `neuron` listy, także dla neuronu z jednym wejściem: `[km]`, a nie `km`. Jeśli wywołania z jednym wejściem są poprawne, ale `neuron([0.5, 0.0], [4, 4], -3)` daje około `0.018`, wyraz wolny jest dodawany raz dla każdego wejścia, a powinien trafić do sumy tylko raz.
