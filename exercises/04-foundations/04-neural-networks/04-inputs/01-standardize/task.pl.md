---
description: Policz średnią i rozrzut listy liczb i wystandaryzuj nowe zamówienia średnią i rozrzutem zamówień treningowych.
---

# Standaryzacja wejść

Dokończ trzy funkcje do standaryzacji takiej jak w części [Standaryzacja wejść](../../../../../notes/04-foundations/04-neural-networks/04-inputs.pl.md#standaryzacja-wejść):

- `average(values)` zwraca średnią liczb z listy `values`.
- `spread(values)` zwraca ich rozrzut, czyli odchylenie standardowe: pierwiastek kwadratowy ze średniej kwadratów ich odległości od ich średniej.
- `standardize(values, training)` zwraca nową listę, w której każda liczba z `values` jest wystandaryzowana średnią i rozrzutem `training`: pomniejszona o średnią i podzielona przez rozrzut.

`TRAINING_KMS` to osiem zamówień, na których trenowano sieć w lekcji [Trening sieci](../../../../../notes/04-foundations/04-neural-networks/03-training.pl.md), a `NEW_KMS` to trzy nowe zamówienia.

| Wywołanie                                     | Zwraca                           |
| --------------------------------------------- | -------------------------------- |
| `average(TRAINING_KMS)`                       | `7.25`                           |
| `spread([2, 4, 6, 8, 10, 12, 14])`            | `4.0`                            |
| `spread(TRAINING_KMS)`                        | około `4.265`                    |
| `standardize([14], [2, 4, 6, 8, 10, 12, 14])` | `[1.5]`                          |
| `standardize(NEW_KMS, TRAINING_KMS)`          | około `[-0.997, -0.762, -0.528]` |

Tabela zaokrągla wyniki do 3 miejsc po przecinku, ale sprawdzenia tego nie robią. Średnia zamówień treningowych, 7,25 km, jest niedaleko 7 km, które w części [Mierzenie od środka](../../../../../notes/04-foundations/04-neural-networks/03-training.pl.md#mierzenie-od-środka) posłużyły za ich środek. Gdy uruchomisz kod, jego ostatni wiersz wypisze średnią i rozrzut zamówień treningowych po standaryzacji, które powinny wynosić 0 i 1.

Jeśli `spread(TRAINING_KMS)` daje około `4.559`, funkcja dzieli przez 7, czyli o jeden mniej niż liczba wartości, tak jak `statistics.stdev`. Rozrzut z lekcji dzieli przez liczbę wartości, czyli przez 8.

Jeśli `standardize(NEW_KMS, TRAINING_KMS)` daje około `[-1.225, 0.0, 1.225]` albo `standardize([5], TRAINING_KMS)` zgłasza `ZeroDivisionError`, `standardize` liczy średnią i rozrzut `values` zamiast `training`. Pojedyncze zamówienie jest swoją własną średnią, więc jego rozrzut wynosi 0, jak w części [Nowe zamówienia](../../../../../notes/04-foundations/04-neural-networks/04-inputs.pl.md#nowe-zamówienia).
