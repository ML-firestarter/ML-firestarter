---
description: Utwórz warstwę nn.Linear z podanymi wagami i wyrazem wolnym zamiast losowych.
---

# Model z wybranymi wagami

W części [Trening](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md#trening) wagi z lekcji o regresji liniowej ręcznie zostały skopiowane do warstwy, żeby trening zaczął się z tego samego miejsca. Dokończ funkcję `make_model(weights, bias)`, która tworzy `nn.Linear` z jednym wyjściem i tyloma wejściami, ile liczb jest na liście `weights`. Warstwa ma zaczynać dokładnie od tych wag, a jej wyrazem wolnym ma być liczba `bias`.

Waga warstwy ma kształt `[1, inputs]`, czyli jest wierszem, a `weights` to zwykła lista, więc przed skopiowaniem trzeba z niej zrobić tensor o kształcie wiersza. Wagi wymagają gradientu, więc zmienia się je wewnątrz `torch.no_grad()`.

| Wywołanie                                                 | Zwraca                         |
| --------------------------------------------------------- | ------------------------------ |
| `make_model([3.0, 0.5], 8.0).weight`                      | wagę z liczbami `[[3.0, 0.5]]` |
| `make_model([3.0, 0.5], 8.0).bias`                        | wyraz wolny z liczbą `[8.0]`   |
| `make_model([3.0, 0.5], 8.0)(torch.tensor([[4.0, 6.0]]))` | predykcję `23.0`               |

Model nadal musi być warstwą, którą da się trenować: jego waga i wyraz wolny muszą wymagać gradientu, tak jak wtedy, gdy tworzy je sama warstwa, a `model.parameters()` musi je zwracać. Jeśli warstwa przewiduje coś innego niż 23, liczby wag albo wyrazu wolnego do niej nie trafiły.
