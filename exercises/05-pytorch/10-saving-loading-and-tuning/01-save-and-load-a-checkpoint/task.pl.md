---
description: Napisz dwie połowy punktu kontrolnego, czyli zachowanie modelu z ustawieniami, które go zbudowały, i zbudowanie go z powrotem z wagami.
---

# Zapisz i wczytaj punkt kontrolny

[Zapis modelu](../../../../notes/05-pytorch/10-saving-loading-and-tuning.pl.md#zapis-modelu) zachował słownik stanu modelu z jego hiperparametrami i zbudował z nich model z powrotem. Dokończ dwie funkcje:

- `make_checkpoint(model, hyperparameters)` zwraca słownik do zapisu: słownik stanu modelu pod kluczem `"model_state_dict"` i `hyperparameters` pod kluczem `"hyperparameters"`.
- `build_from_checkpoint(checkpoint)` zwraca nowy model, zrobiony przez `make_model` z hiperparametrów punktu kontrolnego, z wczytanymi zapisanymi wagami i w trybie oceny.

`make_model(n_inputs, n_hidden, n_classes)` jest gotowe. Robi sieć z warstwą ukrytą, a `hyperparameters` to słownik z jego trzema argumentami, jak `{"n_inputs": 2, "n_hidden": 3, "n_classes": 2}`, który można przekazać jako `make_model(**hyperparameters)`.

| Wywołanie                                                 | Zwraca                                            |
| --------------------------------------------------------- | ------------------------------------------------- |
| `make_checkpoint(model, settings).keys()`                 | klucze `"model_state_dict"` i `"hyperparameters"` |
| `build_from_checkpoint(make_checkpoint(model, settings))` | model z wagami `model`, który przewiduje to samo  |

Testy zapisują też punkt kontrolny do pamięci przez `torch.save`, wczytują go przez `torch.load(..., weights_only=True)` i budują model z tego, co wróci, a ten musi przewidywać to samo co oryginał, liczba w liczbę. Model zrobiony przez `make_model` zaczyna od losowych wag, więc jeśli predykcje się różnią, zapisane wagi się nie dostały.
