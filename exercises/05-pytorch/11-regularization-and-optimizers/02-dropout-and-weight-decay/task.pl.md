---
description: Zbuduj klasyfikator z dropoutem po każdej warstwie ukrytej, daj mu optymalizator z zanikiem wag i przewiduj przy wyłączonym dropoucie.
---

# Dropout i zanik wag

[Zanik wag](../../../../notes/05-pytorch/11-regularization-and-optimizers.pl.md#zanik-wag) i [dropout](../../../../notes/05-pytorch/11-regularization-and-optimizers.pl.md#dropout) powstrzymały sieć przed uczeniem się obrazów treningowych na pamięć. Dokończ trzy funkcje, które przygotowują sieć z oboma tymi mechanizmami:

- `make_model(n_inputs, n_hidden, n_classes, dropout)` zwraca `nn.Sequential` z dwiema warstwami ukrytymi: `Linear`, `ReLU` i `Dropout`, jeszcze raz te same trzy i na końcu `Linear` z jednym wyjściem dla każdej klasy. Obie warstwy ukryte mają po `n_hidden` liczb, a obie warstwy `Dropout` zerują liczby z prawdopodobieństwem `dropout`.
- `make_optimizer(model, learning_rate, weight_decay)` zwraca `AdamW` dla parametrów modelu, z podanym współczynnikiem uczenia i zanikiem wag.
- `predict(model, X)` zwraca klasę, którą model wybiera dla każdego wiersza `X`, jako tensor numerów klas. Najpierw przełącza model w tryb oceny, żeby nic nie było zerowane, i działa wewnątrz `torch.no_grad()`.

| Wywołanie                          | Zwraca                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `make_model(4, 8, 3, 0.5)`         | 7 warstw: `Linear(4, 8)`, `ReLU`, `Dropout(0.5)`, `Linear(8, 8)`, `ReLU`, `Dropout(0.5)`, `Linear(8, 3)` |
| `make_optimizer(model, 0.01, 0.1)` | `AdamW` z `lr` równym 0,01 i `weight_decay` równym 0,1                                                   |
| `predict(model, torch.ones(7, 4))` | 7 numerów klas, za każdym razem tych samych                                                              |

Warstwa `Dropout` nie ma wag, więc sieć z dropoutem startuje z tych samych wag co sieć bez niego. Korzysta z tego jedno sprawdzenie: porównuje twoją sieć w trybie oceny ze zwykłą siecią utworzoną z tego samego ziarna. `print` wywołany na modelu pokazuje jego warstwy, a na optymalizatorze jego ustawienia. Przyda się, gdy nie przechodzi któreś ze sprawdzeń, które ich dotyczą.

Jeśli `predict` przy każdym wywołaniu daje dla tych samych wierszy inne klasy, model jest nadal w trybie treningowym, a dropout przy każdym wywołaniu zeruje inne liczby.
