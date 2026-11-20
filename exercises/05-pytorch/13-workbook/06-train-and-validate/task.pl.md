---
description: Trenuj nn.Linear przez kilka epok i po każdej mierz RMSE na zbiorze walidacyjnym.
---

# Trenuj i waliduj

*Korzysta z lekcji [Regresja liniowa z nn.Linear](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md), z której przydadzą się `nn.Linear`, `MSELoss` i `SGD`, oraz z lekcji [Porcje danych i ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md), z której przydadzą się epoki, ocena i loadery.*

`make_loaders` z poprzedniego ćwiczenia i `evaluate(model, loader)`, które zwraca RMSE modelu na danych z loadera jako zwykłą liczbę, są już gotowe. Dokończ funkcję `train_and_validate(model, train_loader, valid_loader, learning_rate, epochs)`:

- Trenuje `model` w miejscu z `nn.MSELoss()` i `SGD` ze współczynnikiem uczenia `learning_rate` przez `epochs` epok na `train_loader`, z jednym krokiem na każdą porcję.
- Po każdej epoce mierzy `evaluate(model, valid_loader)`, zaokrągla wynik do 3 miejsc po przecinku i dodaje go do listy.
- Zwraca tę listę, z jednym RMSE na każdą epokę, a dla 0 epok pustą listę.

| Wywołanie dla `nn.Linear(2, 1)` utworzonego po `torch.manual_seed(1)`, `make_loaders(X, y, 80, 20, 16)` i `learning_rate=0.05` | Zwraca                                        |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `train_and_validate(model, train_loader, valid_loader, 0.05, 6)`                                                               | `[19.565, 11.344, 6.565, 3.777, 2.18, 1.297]` |

RMSE spada, gdy prosta uczy się opłat, a przy `learning_rate=0.0` stoi w miejscu. Kod startowy mierzy, ale nie trenuje, więc liczby się nie zmieniają.
