---
description: Zbuduj klasyfikator z dropoutem po każdej warstwie ukrytej, daj mu optymalizator z zanikiem wag i przewiduj z wyłączonym dropoutem.
---

# Dropout i zanik wag

[Zanik wag](../../../../notes/05-pytorch/11-regularization-and-optimizers.pl.md#zanik-wag) i [Dropout](../../../../notes/05-pytorch/11-regularization-and-optimizers.pl.md#dropout) nie pozwalały sieci nauczyć się obrazów treningowych na pamięć. Dokończ trzy funkcje, które przygotowują sieć z jednym i drugim:

- `make_model(n_inputs, n_hidden, n_classes, dropout)` zwraca `nn.Sequential` z dwiema warstwami ukrytymi: `Linear`, `ReLU` i `Dropout`, jeszcze raz te same trzy, a na końcu `Linear` z wyjściem dla każdej klasy. Obie warstwy ukryte mają `n_hidden` liczb, a obie warstwy `Dropout` zerują z prawdopodobieństwem `dropout`.
- `make_optimizer(model, learning_rate, weight_decay)` zwraca `AdamW` dla parametrów modelu, z tym współczynnikiem uczenia i tym zanikiem wag.
- `predict(model, X)` zwraca klasę, którą model wybiera dla każdego wiersza `X`, jako tensor numerów klas. Najpierw przełącza model w tryb oceny, żeby nic nie było zerowane, i liczy wewnątrz `torch.no_grad()`.

| Wywołanie                          | Zwraca                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `make_model(4, 8, 3, 0.5)`         | 7 warstw: `Linear(4, 8)`, `ReLU`, `Dropout(0.5)`, `Linear(8, 8)`, `ReLU`, `Dropout(0.5)`, `Linear(8, 3)` |
| `make_optimizer(model, 0.01, 0.1)` | `AdamW`, z `lr` 0,01 i `weight_decay` 0,1                                                                 |
| `predict(model, torch.ones(7, 4))` | 7 numerów klas, za każdym razem te same                                                                   |

Warstwa `Dropout` nie ma wag, więc sieć z dropoutem zaczyna od tych samych wag co sieć bez niego. Jedno ze sprawdzeń z tego korzysta: porównuje twoją sieć, w trybie oceny, ze zwykłą, zrobioną z tego samego ziarna. Wypisanie modelu pokazuje jego warstwy, a wypisanie optymalizatora jego ustawienia, co pomaga, gdy nie przechodzi sprawdzenie, które ich dotyczy.

Jeśli `predict` daje inne klasy za każdym razem, gdy wywołasz je dla tych samych wierszy, model jest nadal w trybie treningu, a dropout przy każdym wywołaniu zeruje inne liczby.
