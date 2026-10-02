---
description: Trenuj nn.Linear przez kilka epok i po każdej mierz jego RMSE na zbiorze walidacyjnym.
---

# Trenuj i waliduj

*Korzysta z [Regresja liniowa z nn.Linear](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md) dla `nn.Linear`, `MSELoss` i `SGD` oraz [Porcje danych i ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md) dla epok, oceny i loaderów.*

`make_loaders` z poprzedniego ćwiczenia i `evaluate(model, loader)`, które daje RMSE modelu na loaderze jako zwykłą liczbę, są już napisane. Dokończ `train_and_validate(model, train_loader, valid_loader, learning_rate, epochs)`:

- Trenuje `model` w miejscu z `nn.MSELoss()` i `SGD` o `learning_rate`, przez `epochs` epok na `train_loader`, jeden krok na każdą porcję.
- Po każdej epoce mierzy `evaluate(model, valid_loader)`, zaokrągla do 3 miejsc po przecinku i dodaje do listy.
- Zwraca listę: jedno RMSE na każdą epokę i pustą listę dla 0 epok.

| Wywołanie, z `nn.Linear(2, 1)` zrobionym po `torch.manual_seed(1)`, `make_loaders(X, y, 80, 20, 16)` i `learning_rate=0.05` | Zwraca                                                 |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `train_and_validate(model, train_loader, valid_loader, 0.05, 6)`                                                             | `[19.565, 11.344, 6.565, 3.777, 2.18, 1.297]`          |

RMSE spada, gdy prosta uczy się opłat, a przy `learning_rate=0.0` zostaje tam, gdzie była. Kod, od którego zaczynasz, mierzy, ale nie trenuje, więc liczby się nie zmieniają.
