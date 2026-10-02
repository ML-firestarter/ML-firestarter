---
description: Ustandaryzuj kilometry i opłaty, wytrenuj na nich prostą autogradem i zamień ją z powrotem na euro za kilometr i opłatę początkową.
---

# Dopasowanie w jednostkach standardowych

*Korzysta z [Tensory](../../../../notes/05-pytorch/01-tensors.pl.md) dla `mean()` i `std()`, [Autograd](../../../../notes/05-pytorch/02-autograd.pl.md) dla pętli treningowej oraz [Regresja liniowa ręcznie](../../../../notes/05-pytorch/04-linear-regression-by-hand.pl.md) dla dopasowania prostej.*

Trening działa najlepiej, gdy liczby są blisko 0, więc zwykle standaryzuje się je najpierw. Dokończ `fit_in_standard_units(km, fares, learning_rate, steps)`:

1. Ustandaryzuj `km` i `fares`: odejmij średnią i podziel przez odchylenie standardowe, z `std(correction=0)`.
2. Wytrenuj `w` i `b` prostej `w * x + b` na ustandaryzowanych liczbach, od 0 i 0, przez `steps` kroków spadku gradientu ze średnim błędem kwadratowym.
3. Zamień prostą z powrotem na pierwotne jednostki. Przy `x = (km - km_mean) / km_std` i `y = (fares - fares_mean) / fares_std` opłata dla `km` to `per_km * km + fee`, gdzie `per_km = w * fares_std / km_std`, a `fee = fares_mean + b * fares_std - per_km * km_mean`.
4. Zwróć `[per_km, fee]` jako zwykłe liczby zaokrąglone do 2 miejsc po przecinku.

| Wywołanie, z kursami dnia `km = [2, 4, 6, 8]` i `fares = [15, 23, 29, 33]` | Zwraca          |
| --------------------------------------------------------------------------- | --------------- |
| `fit_in_standard_units(km, fares, 0.1, 300)`                                | `[3.0, 10.0]`   |
| `fit_in_standard_units(km, fares, 0.1, 0)`                                  | `[0.0, 25.0]`   |

Bez kroków prosta jest wszędzie równa 0 w jednostkach standardowych, czyli średniej opłacie, 25, w złotych. Po 300 krokach ze współczynnikiem uczenia 0,1 trening na ustandaryzowanych liczbach dawno zbiegł do prostej z lekcji: 3 za kilometr i opłata początkowa 10.
