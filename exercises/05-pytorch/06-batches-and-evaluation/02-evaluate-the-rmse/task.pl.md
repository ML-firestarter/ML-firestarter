---
description: Zmierz model na wszystkich porcjach loadera, z RMSE wszystkich kursów, a nie średnią z RMSE porcji.
---

# Oceń RMSE

Część [Ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md#ocena) przełączyła model w tryb oceny, policzyła predykcje bez zapisu i zmierzyła RMSE wszystkich kursów, które nie jest średnią z RMSE porcji, gdy ostatnia porcja jest mniejsza. Dokończ `evaluate_rmse(model, loader)`, które zwraca RMSE predykcji modelu dla wszystkich kursów w `loader`, jako zwykłą liczbę: pierwiastek ze średniej kwadratów błędów każdego kursu. `loader` oddaje pary cech i etykiet, o kształcie `[rows, 1]`.

`X` i `y` zawierają kursy dzienne z lekcji, a `make_model` to funkcja z poprzednich ćwiczeń. Kod ma szkielet pętli; brakuje przejścia po porcjach bez zapisu i zsumowania kwadratów błędów oraz liczby kursów.

| Wywołanie                                            | Zwraca         |
| ---------------------------------------------------- | -------------- |
| `evaluate_rmse(make_model([3.0, 0.0], 8.0), loader)` | około `2.2361` |
| `evaluate_rmse(make_model([3.0, 0.5], 8.0), loader)` | `0.0`          |

Pierwszy model pomija postój: jego błędy na czterech kursach to 1, 3, 3 i 1, więc błąd średniokwadratowy wynosi 5, a RMSE to √5. Testy próbują loaderów z porcjami po 1, 3 i 4 kursy, a odpowiedź musi być dla wszystkich taka sama. Przy porcjach po 3 średnia z RMSE dwóch porcji wyniosłaby około 1,76, a to nie jest RMSE czterech kursów.
