---
description: Utwórz optymalizator na podstawie jego nazwy i porównaj kilka z nich uczciwie, każdy od tych samych wag początkowych.
---

# Porównaj optymalizatory

Część [Na cyfrach](../../../../notes/05-pytorch/11-regularization-and-optimizers.pl.md#na-cyfrach) trenowała tę samą sieć trzema optymalizatorami. Takie porównanie jest uczciwe tylko wtedy, gdy cała reszta jest taka sama: dane, liczba kroków i wagi, od których sieć zaczyna. Dokończ dwie funkcje:

- `make_optimizer(name, parameters, learning_rate)` zwraca optymalizator o nazwie `name` dla `parameters`, z tym współczynnikiem uczenia. `"sgd"` to zwykłe `SGD`, `"momentum"` to `SGD` z pędem 0,9, a `"adam"` to `Adam`. Każda inna nazwa zgłasza `ValueError`.
- `compare(names, learning_rate, steps)` trenuje sieć każdym z optymalizatorów z `names` i zwraca słownik ze stratą, na której każdy kończy, według jego nazwy. Każdy optymalizator dostaje własną sieć, zrobioną przez `make_model()` zaraz po `torch.manual_seed(0)`, żeby wszystkie zaczynały od tych samych wag.

`make_model()` i `train(model, optimizer, steps)` są już napisane. `train` robi `steps` kroków na 64 kursach, których opłaty załamują się przy 6 km, i zwraca stratę po nich, zaokrągloną do 4 miejsc po przecinku.

| Wywołanie                                        | Zwraca                                                |
| ------------------------------------------------ | ----------------------------------------------------- |
| `compare(["sgd", "momentum", "adam"], 0.01, 20)` | `{"sgd": 0.1885, "momentum": 0.0692, "adam": 0.0475}` |
| `compare(["adam", "sgd"], 0.01, 50)`             | `{"adam": 0.0089, "sgd": 0.0358}`                     |
| `compare(["sgd", "momentum", "adam"], 0.01, 0)`  | `{"sgd": 0.56, "momentum": 0.56, "adam": 0.56}`       |

Ostatni wiersz pokazuje, że porównanie jest uczciwe. Bez żadnego kroku trzy sieci są wciąż takie, jakie były na początku, a tę samą stratę mają tylko wtedy, gdy mają te same wagi.

Kod, od którego zaczynasz, trenuje jedną sieć wszystkimi optymalizatorami, jednym po drugim. Drugi optymalizator rusza stamtąd, gdzie skończył pierwszy, więc wygląda lepiej, niż jest, a liczby zmieniają się razem z kolejnością nazw. Jeśli u ciebie nadal się zmieniają, sieci nie zaczynają od tych samych wag: każdą trzeba zrobić od nowa, a przed nią jeszcze raz ustawić ziarno.
