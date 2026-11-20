---
description: Zmierz model na wszystkich porcjach z loadera, licząc RMSE wszystkich kursów, a nie średnią z RMSE porcji.
---

# Zmierz RMSE

W części [Ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md#ocena) model został przełączony w tryb oceny, policzył predykcje bez zapisu i zmierzył RMSE wszystkich kursów, które nie jest średnią z RMSE porcji, gdy ostatnia porcja jest mniejsza. Dokończ funkcję `evaluate_rmse(model, loader)`, która zwraca RMSE predykcji modelu dla wszystkich kursów z `loader` jako zwykłą liczbę: pierwiastek ze średniej kwadratów błędów wszystkich kursów. `loader` podaje pary cech i etykiet o kształcie `[rows, 1]`.

`X` i `y` zawierają kursy dzienne z lekcji, a `make_model` to funkcja z poprzednich ćwiczeń. W kodzie jest szkielet pętli. Brakuje przejścia po porcjach bez zapisu oraz zsumowania kwadratów błędów i liczby kursów.

| Wywołanie                                            | Zwraca         |
| ---------------------------------------------------- | -------------- |
| `evaluate_rmse(make_model([3.0, 0.0], 8.0), loader)` | około `2.2361` |
| `evaluate_rmse(make_model([3.0, 0.5], 8.0), loader)` | `0.0`          |

Pierwszy model pomija postój: jego błędy na czterech kursach to 1, 3, 3 i 1, więc błąd średniokwadratowy wynosi 5, a RMSE to √5. Testy sprawdzają loadery z porcjami po 1, 3 i 4 kursy, a odpowiedź musi być dla wszystkich taka sama. Przy porcjach po 3 średnia z RMSE obu porcji wyniosłaby około 1,76, a to nie jest RMSE czterech kursów.
