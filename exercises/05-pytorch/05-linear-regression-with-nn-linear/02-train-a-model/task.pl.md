---
description: Wytrenuj dowolny model funkcją straty i optymalizatorem i zachowaj stratę z każdej epoki.
---

# Wytrenuj model

[Trening](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md#trening) wytrenował warstwę z `nn.MSELoss` i `torch.optim.SGD`. Dokończ `train(model, X, y, learning_rate, n_epochs)`, które trenuje `model` na tabeli `X` i etykietach `y` przez `n_epochs` epok spadku gradientu, z błędem średniokwadratowym jako stratą, i zwraca listę strat z każdej epoki, jako zwykłe liczby, przy czym pierwsza to strata przed jakimkolwiek krokiem. Trenuje podany model, w miejscu.

`make_model` to funkcja z poprzedniego ćwiczenia, a `X` i `y` zawierają kursy dzienne z lekcji.

| Wywołanie                                           | Zwraca                          |
| --------------------------------------------------- | ------------------------------- |
| `train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 3)` | około `[671.0, 15.162, 10.894]` |
| `train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 0)` | `[]`                            |

Po 5000 epokach model jest modelem z naklejki: wagi 3 i 0,5 oraz wyraz wolny 8. Kod ma już kryterium i pętlę, która zbiera straty. Brakuje optymalizatora, a w pętli pozostałych kroków: `backward()`, `step()` i `zero_grad()`. Jeśli twoje straty wychodzą takie same w każdej epoce, nic nie zrobiło kroku.
