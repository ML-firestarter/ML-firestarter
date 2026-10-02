---
description: Wypróbuj kilka współczynników uczenia, zachowaj najlepszy model jako punkt kontrolny i zbuduj z niego model z powrotem.
---

# Dostrój i zachowaj

*Korzysta z [Zapis, wczytywanie i strojenie](../../../../notes/05-pytorch/10-saving-loading-and-tuning.pl.md) dla szukania ustawień i zapisu modeli, [Porcje danych i ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md) dla loaderów i oceny oraz [Regresja liniowa z nn.Linear](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md) dla `nn.Linear`.*

`make_loaders`, `evaluate` i loadery po 80 kursów treningowych, 20 walidacyjnych i 20 testowych są w kodzie, tak samo jak `train_model(learning_rate)`: trenuje nowe `nn.Linear(2, 1)` przez 15 epok z tym współczynnikiem uczenia i zwraca `(model, valid_rmse)`. Dokończ dwie funkcje:

- `search(learning_rates)` trenuje model dla każdego współczynnika uczenia z listy i zwraca słownik dla tego z najniższym `valid_rmse`: jego `"learning_rate"`, jego `"valid_rmse"` i jego `"model_state_dict"`, czyli `state_dict()` modelu. Gdy dwa modele są równe, zostaje wcześniejszy.
- `load_best(checkpoint)` zwraca nowe `nn.Linear(2, 1)` z wczytanymi wagami z punktu kontrolnego, w trybie oceny.

| Wywołanie                                     | Zwraca                                                             |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `search([0.0001, 0.01, 0.1, 0.2])`            | słownik dla współczynnika uczenia `0.2`, z RMSE około `0.73`       |
| `load_best(search([0.1]))`                    | model, którego RMSE na loaderze walidacyjnym jest takie jak w słowniku |

Zbyt mały współczynnik uczenia, jak 0,0001, nie nauczył się wiele w 15 epokach, a `0.01` wciąż jest daleko od najlepszego. Testy przepuszczają też punkt kontrolny przez `torch.save` i `torch.load(..., weights_only=True)` i budują model z tego, co wróci, którego RMSE musi być takie samo.
