---
description: Wytrenuj dowolny model za pomocą funkcji straty i optymalizatora i zapisuj stratę z każdej epoki.
---

# Wytrenuj model

W części [Trening](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md#trening) warstwa została wytrenowana z `nn.MSELoss` i `torch.optim.SGD`. Dokończ funkcję `train(model, X, y, learning_rate, n_epochs)`, która trenuje `model` na tabeli `X` i etykietach `y` przez `n_epochs` epok spadku gradientu, z błędem średniokwadratowym jako stratą, i zwraca listę strat z każdej epoki jako zwykłych liczb. Pierwsza z nich to strata sprzed jakiegokolwiek kroku. Funkcja trenuje podany model w miejscu.

`make_model` to funkcja z poprzedniego ćwiczenia, a `X` i `y` zawierają kursy dzienne z lekcji.

| Wywołanie                                           | Zwraca                          |
| --------------------------------------------------- | ------------------------------- |
| `train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 3)` | około `[671.0, 15.162, 10.894]` |
| `train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 0)` | `[]`                            |

Po 5000 epokach model pokrywa się z cennikiem z naklejki: wagi 3 i 0,5 oraz wyraz wolny 8. W kodzie są już funkcja straty i pętla, która zbiera straty. Brakuje optymalizatora, a w pętli pozostałych kroków: `backward()`, `step()` i `zero_grad()`. Jeśli twoje straty są takie same w każdej epoce, żaden krok nie został wykonany.
