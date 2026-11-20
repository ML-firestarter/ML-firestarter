---
description: Napisz pętlę po porcjach jednej epoki, z krokiem dla każdej porcji, i zwróć średnią stratę.
---

# Wytrenuj jedną epokę

W części [Epoka](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md#epoka) trening przechodzi przez wszystkie porcje zbioru treningowego i dla każdej robi krok. Dokończ funkcję `train_one_epoch(model, loader, criterion, optimizer)`, która robi to dla dowolnego modelu i zwraca średnią ze strat porcji jako zwykłą liczbę. `loader` podaje pary cech i etykiet, `criterion` to funkcja straty, na przykład `nn.MSELoss()`, a `optimizer` został utworzony dla parametrów modelu. Model jest trenowany w miejscu.

Kod już przechodzi po porcjach i sumuje ich straty. Brakuje przełączenia modelu w tryb treningowy, a dla każdej porcji pozostałych kroków: wyzerowania nachyleń, `backward()` i `step()`. `X` i `y` zawierają kursy dzienne z lekcji, a `make_model` to funkcja z ćwiczenia do [lekcji o `nn.Linear`](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md).

| Wywołanie dla modelu z zerowymi wagami i `SGD` z `lr=0.01`             | Zwraca               |
| ---------------------------------------------------------------------- | -------------------- |
| `train_one_epoch(model, loader, nn.MSELoss(), optimizer)`, porcje po 2 | około `315.035`      |
| to samo, ze wszystkimi 4 kursami w jednej porcji                       | `671.0` i jeden krok |

Pierwsza porcja z 2 kursami ma stratę 377, a druga, już po pierwszym kroku, około 253,07, więc ich średnia to 315,0. Jeśli strata w drugiej epoce nie wynosi 23,2, nachylenia nie były zerowane między porcjami.
