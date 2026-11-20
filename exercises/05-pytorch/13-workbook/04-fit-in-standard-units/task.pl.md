---
description: Standaryzuj kilometry i opłaty, wytrenuj na nich prostą za pomocą autogradu i przelicz ją z powrotem na złote za kilometr i opłatę początkową.
---

# Dopasowanie w jednostkach standardowych

*Korzysta z lekcji [Tensory](../../../../notes/05-pytorch/01-tensors.pl.md), z której przydadzą się `mean()` i `std()`, z lekcji [Autograd](../../../../notes/05-pytorch/02-autograd.pl.md), z której przyda się pętla treningowa, oraz z lekcji [Regresja liniowa ręcznie](../../../../notes/05-pytorch/04-linear-regression-by-hand.pl.md), z której przyda się dopasowanie prostej.*

Trening działa najlepiej, gdy liczby są bliskie 0, dlatego zwykle najpierw się je standaryzuje. Dokończ funkcję `fit_in_standard_units(km, fares, learning_rate, steps)`:

1. Standaryzuj `km` i `fares`: odejmij średnią i podziel przez odchylenie standardowe, liczone przez `std(correction=0)`.
2. Wytrenuj `w` i `b` prostej `w * x + b` na standaryzowanych liczbach, zaczynając od 0 i 0, przez `steps` kroków spadku gradientu z błędem średniokwadratowym.
3. Przelicz prostą z powrotem na pierwotne jednostki. Gdy `x = (km - km_mean) / km_std` i `y = (fares - fares_mean) / fares_std`, opłata za `km` to `per_km * km + fee`, gdzie `per_km = w * fares_std / km_std`, a `fee = fares_mean + b * fares_std - per_km * km_mean`.
4. Zwróć `[per_km, fee]` jako zwykłe liczby zaokrąglone do 2 miejsc po przecinku.

| Wywołanie dla kursów dziennych, `km = [2, 4, 6, 8]` i `fares = [15, 23, 29, 33]` | Zwraca        |
| -------------------------------------------------------------------------------- | ------------- |
| `fit_in_standard_units(km, fares, 0.1, 300)`                                     | `[3.0, 10.0]` |
| `fit_in_standard_units(km, fares, 0.1, 0)`                                       | `[0.0, 25.0]` |

Bez kroków prosta w jednostkach standardowych jest wszędzie równa 0, co w złotych oznacza średnią opłatę, 25. Po 300 krokach ze współczynnikiem uczenia 0,1 trening na standaryzowanych liczbach dawno zbiegł do prostej z lekcji: 3 zł za kilometr i 10 zł opłaty początkowej.
