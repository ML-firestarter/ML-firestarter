---
description: Utwórz optymalizator na podstawie nazwy i porównaj uczciwie kilka optymalizatorów, każdy startujący z tych samych wag.
---

# Porównaj optymalizatory

W części [Na cyfrach](../../../../notes/05-pytorch/11-regularization-and-optimizers.pl.md#na-cyfrach) ta sama sieć była trenowana trzema optymalizatorami. Takie porównanie jest uczciwe tylko wtedy, gdy wszystko inne jest takie samo: dane, liczba kroków i wagi, od których sieć startuje. Dokończ dwie funkcje:

- `make_optimizer(name, parameters, learning_rate)` zwraca optymalizator o nazwie `name` dla parametrów `parameters`, z podanym współczynnikiem uczenia. `"sgd"` to zwykłe `SGD`, `"momentum"` to `SGD` z momentum 0,9, a `"adam"` to `Adam`. Każda inna nazwa zgłasza `ValueError`.
- `compare(names, learning_rate, steps)` trenuje sieć każdym z optymalizatorów z listy `names` i zwraca słownik ze stratą, na której skończył każdy z nich, pod jego nazwą. Każdy optymalizator dostaje własną sieć, utworzoną przez `make_model()` zaraz po `torch.manual_seed(0)`, dzięki czemu wszystkie startują z tych samych wag.

`make_model()` i `train(model, optimizer, steps)` są już gotowe. `train` robi `steps` kroków na 64 kursach, których opłaty zmieniają nachylenie przy 6 km, i zwraca stratę po tych krokach, zaokrągloną do 4 miejsc po przecinku.

| Wywołanie                                        | Zwraca                                                |
| ------------------------------------------------ | ----------------------------------------------------- |
| `compare(["sgd", "momentum", "adam"], 0.01, 20)` | `{"sgd": 0.1885, "momentum": 0.0692, "adam": 0.0475}` |
| `compare(["adam", "sgd"], 0.01, 50)`             | `{"adam": 0.0089, "sgd": 0.0358}`                     |
| `compare(["sgd", "momentum", "adam"], 0.01, 0)`  | `{"sgd": 0.56, "momentum": 0.56, "adam": 0.56}`       |

Ostatni wiersz pokazuje, że porównanie jest uczciwe. Bez żadnych kroków trzy sieci są takie, jakie były na starcie, i mają tę samą stratę tylko wtedy, gdy mają te same wagi.

Kod startowy trenuje jedną sieć wszystkimi optymalizatorami po kolei. Drugi optymalizator zaczyna tam, gdzie skończył pierwszy, więc wypada lepiej, niż powinien, a wyniki zależą od kolejności nazw. Jeśli u ciebie nadal tak jest, sieci nie startują z tych samych wag: każdą trzeba utworzyć od nowa i przed każdą ponownie ustawić ziarno.
