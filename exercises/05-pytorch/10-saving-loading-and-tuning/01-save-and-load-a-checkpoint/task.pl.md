---
description: Napisz obie połowy punktu kontrolnego, czyli zapisanie modelu z ustawieniami, z których powstał, i odtworzenie go razem z wagami.
---

# Zapisz i wczytaj punkt kontrolny

W części [Zapis modelu](../../../../notes/05-pytorch/10-saving-loading-and-tuning.pl.md#zapis-modelu) słownik stanu modelu został zapisany razem z hiperparametrami, a potem model został z nich odtworzony. Dokończ dwie funkcje:

- `make_checkpoint(model, hyperparameters)` zwraca słownik do zapisania: słownik stanu modelu pod kluczem `"model_state_dict"` i `hyperparameters` pod kluczem `"hyperparameters"`.
- `build_from_checkpoint(checkpoint)` zwraca nowy model utworzony przez `make_model` z hiperparametrów z punktu kontrolnego, z wczytanymi zapisanymi wagami, w trybie oceny.

`make_model(n_inputs, n_hidden, n_classes)` jest już gotowe. Tworzy sieć z jedną warstwą ukrytą, a `hyperparameters` to słownik z trzema argumentami tej funkcji, na przykład `{"n_inputs": 2, "n_hidden": 3, "n_classes": 2}`, który można przekazać jako `make_model(**hyperparameters)`.

| Wywołanie                                                 | Zwraca                                            |
| --------------------------------------------------------- | ------------------------------------------------- |
| `make_checkpoint(model, settings).keys()`                 | klucze `"model_state_dict"` i `"hyperparameters"` |
| `build_from_checkpoint(make_checkpoint(model, settings))` | model z wagami `model`, który przewiduje to samo  |

Testy zapisują też punkt kontrolny w pamięci przez `torch.save`, wczytują go przez `torch.load(..., weights_only=True)` i budują model z tego, co wróci, a ten model musi przewidywać dokładnie to samo co oryginał, liczba w liczbę. Model utworzony przez `make_model` zaczyna od losowych wag, więc jeśli predykcje się różnią, zapisane wagi nie zostały wczytane.
