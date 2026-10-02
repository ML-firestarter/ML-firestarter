---
description: Policz, czego model musi się nauczyć, i wypisz kształty wag jego warstw.
---

# Policz parametry

[Układanie warstw](../../../../notes/05-pytorch/07-a-network-with-nn-sequential.pl.md#układanie-warstw) policzyło 2231 liczb, których sieć musi się nauczyć, i wypisało kształty jej tensorów. Dokończ dwie funkcje, które robią to dla dowolnego modelu:

- `count_parameters(model)` zwraca liczbę liczb we wszystkich parametrach `model`, wagach i wyrazach wolnych, jako liczbę całkowitą.
- `layer_shapes(model)` zwraca kształty wag warstw `nn.Linear` z `nn.Sequential`, po kolei, jako listę krotek `(out_features, in_features)`. Warstwy innych rodzajów, jak `nn.ReLU`, są pomijane.

`make_mlp` jest gotowe i to ta funkcja z poprzedniego ćwiczenia.

| Wywołanie                                    | Zwraca                         |
| -------------------------------------------- | ------------------------------ |
| `count_parameters(make_mlp([2, 50, 40, 1]))` | `2231`                         |
| `count_parameters(make_mlp([3, 4, 1]))`      | `21`                           |
| `layer_shapes(make_mlp([2, 50, 40, 1]))`     | `[(50, 2), (40, 50), (1, 40)]` |

`model.parameters()` wymienia tensory, a `numel()` tensora to liczba jego liczb. Waga warstwy ma kształt `[out_features, in_features]`, jak w [lekcji o `nn.Linear`](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md#warstwa-dla-prostej), a `tuple(...)` zamienia kształt w krotkę. `isinstance(layer, nn.Linear)` jest prawdziwe dla warstw do wypisania.
