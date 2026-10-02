---
description: Zrób warstwę nn.Linear z wagami i wyrazem wolnym, które podasz, zamiast losowych.
---

# Model z wybranymi wagami

[Trening](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md#trening) skopiował wagi z lekcji ręcznej do warstwy, żeby zacząć z tego samego miejsca. Dokończ `make_model(weights, bias)`, które tworzy `nn.Linear` z jednym wyjściem i tyloma wejściami, ile jest liczb na liście `weights`, zaczynającą dokładnie od tych wag, a liczba `bias` jest jej wyrazem wolnym.

Waga warstwy ma kształt `[1, inputs]`, czyli wiersz, a `weights` to zwykła lista, więc trzeba z niej zrobić wiersz tensora, zanim zostanie skopiowana. Wagi wymagają gradientu, więc zmienia się je wewnątrz `torch.no_grad()`.

| Wywołanie                                                 | Zwraca                         |
| --------------------------------------------------------- | ------------------------------ |
| `make_model([3.0, 0.5], 8.0).weight`                      | wagę z liczbami `[[3.0, 0.5]]` |
| `make_model([3.0, 0.5], 8.0).bias`                        | wyraz wolny z liczbą `[8.0]`   |
| `make_model([3.0, 0.5], 8.0)(torch.tensor([[4.0, 6.0]]))` | predykcję `23.0`               |

Model nadal jest warstwą do trenowania: jego waga i wyraz wolny muszą wymagać gradientu, jak wtedy, gdy tworzy je warstwa, a `model.parameters()` musi je wymieniać. Jeśli warstwa przewiduje coś innego niż 23, liczby wag albo wyrazu wolnego się nie dostały.
