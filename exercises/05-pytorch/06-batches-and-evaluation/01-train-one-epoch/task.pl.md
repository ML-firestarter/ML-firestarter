---
description: Napisz pętlę po porcjach jednej epoki, z krokiem dla każdej, i zwróć średnią stratę.
---

# Wytrenuj jedną epokę

[Epoka](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md#epoka) przechodzi przez wszystkie porcje zbioru treningowego i robi krok dla każdej. Dokończ `train_one_epoch(model, loader, criterion, optimizer)`, które robi to dla dowolnego modelu i zwraca średnią strat porcji jako zwykłą liczbę. `loader` oddaje pary cech i etykiet, `criterion` to funkcja straty, jak `nn.MSELoss()`, a `optimizer` jest zrobiony dla parametrów modelu. Model jest trenowany w miejscu.

Kod już przechodzi po porcjach i sumuje ich straty. Brakuje trybu treningu modelu i dla każdej porcji pozostałych kroków: wyzerowania nachyleń, `backward()` i `step()`. `X` i `y` zawierają kursy dzienne z lekcji, a `make_model` to funkcja z ćwiczenia [lekcji o `nn.Linear`](../../../../notes/05-pytorch/05-linear-regression-with-nn-linear.pl.md).

| Wywołanie, z modelem zer i `SGD` z `lr=0.01`                           | Zwraca               |
| ---------------------------------------------------------------------- | -------------------- |
| `train_one_epoch(model, loader, nn.MSELoss(), optimizer)`, porcje po 2 | około `315.035`      |
| to samo, z wszystkimi 4 kursami w jednej porcji                        | `671.0` i jeden krok |

Pierwsza porcja z 2 kursami ma stratę 377, a druga, po pierwszym kroku, około 253,07, i ich średnia to 315,0. Jeśli strata drugiej epoki nie wynosi 23,2, nachylenia nie były zerowane między porcjami.
