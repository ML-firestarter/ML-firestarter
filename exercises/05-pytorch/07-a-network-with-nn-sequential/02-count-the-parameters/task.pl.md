---
description: Policz, ile liczb model musi się nauczyć, i wypisz kształty wag jego warstw.
---

# Policz parametry

W części [Układanie warstw](../../../../notes/05-pytorch/07-a-network-with-nn-sequential.pl.md#układanie-warstw) program policzył 2231 liczb, których sieć musi się nauczyć, i wypisał kształty jej tensorów. Dokończ dwie funkcje, które robią to samo dla dowolnego modelu:

- `count_parameters(model)` zwraca liczbę wszystkich liczb w parametrach `model`, czyli w wagach i wyrazach wolnych, jako liczbę całkowitą.
- `layer_shapes(model)` zwraca kształty wag kolejnych warstw `nn.Linear` z `nn.Sequential` jako listę krotek `(out_features, in_features)`. Warstwy innych rodzajów, na przykład `nn.ReLU`, są pomijane.

`make_mlp` jest już gotowe: to ta sama funkcja co w poprzednim ćwiczeniu.

| Wywołanie                                    | Zwraca                         |
| -------------------------------------------- | ------------------------------ |
| `count_parameters(make_mlp([2, 50, 40, 1]))` | `2231`                         |
| `count_parameters(make_mlp([3, 4, 1]))`      | `21`                           |
| `layer_shapes(make_mlp([2, 50, 40, 1]))`     | `[(50, 2), (40, 50), (1, 40)]` |

`model.parameters()` podaje kolejne tensory parametrów, a `numel()` tensora to liczba jego liczb. Waga warstwy ma kształt `[out_features, in_features]`, jak w [lekcji o `nn.Linear`](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md#warstwa-dla-prostej), a `tuple(...)` zamienia kształt na krotkę. `isinstance(layer, nn.Linear)` jest prawdziwe dla warstw, których kształty trzeba podać.
