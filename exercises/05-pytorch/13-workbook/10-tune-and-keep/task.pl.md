---
description: Wypróbuj kilka współczynników uczenia, zachowaj najlepszy model jako punkt kontrolny i odtwórz z niego model.
---

# Dostrój i zachowaj

*Korzysta z lekcji [Zapis, wczytywanie i strojenie](../../../../notes/05-pytorch/10-saving-loading-and-tuning.pl.md), z której przydadzą się szukanie ustawień i zapis modeli, z lekcji [Porcje danych i ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md), z której przydadzą się loadery i ocena, oraz z lekcji [Regresja liniowa z nn.Linear](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md), z której przyda się `nn.Linear`.*

W kodzie są już `make_loaders`, `evaluate` i loadery z 80 kursami treningowymi, 20 walidacyjnymi i 20 testowymi, a także `train_model(learning_rate)`, które trenuje nowe `nn.Linear(2, 1)` przez 15 epok z podanym współczynnikiem uczenia i zwraca `(model, valid_rmse)`. Dokończ dwie funkcje:

- `search(learning_rates)` trenuje model dla każdego współczynnika uczenia z listy i zwraca słownik dla tego z najniższym `valid_rmse`: jego `"learning_rate"`, jego `"valid_rmse"` i jego `"model_state_dict"`, czyli `state_dict()` modelu. Gdy dwa modele wypadają tak samo, wygrywa wcześniejszy.
- `load_best(checkpoint)` zwraca nowe `nn.Linear(2, 1)` z wagami wczytanymi z punktu kontrolnego, w trybie oceny.

| Wywołanie                          | Zwraca                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `search([0.0001, 0.01, 0.1, 0.2])` | słownik dla współczynnika uczenia `0.2`, z RMSE około `0.73`               |
| `load_best(search([0.1]))`         | model, którego RMSE na zbiorze walidacyjnym jest takie samo jak w słowniku |

Przy zbyt małym współczynniku uczenia, takim jak 0,0001, model niewiele się nauczył przez 15 epok, a przy `0.01` wciąż jest daleko od najlepszego. Testy przepuszczają też punkt kontrolny przez `torch.save` i `torch.load(..., weights_only=True)` i budują model z tego, co wróci, a jego RMSE musi być takie samo.
