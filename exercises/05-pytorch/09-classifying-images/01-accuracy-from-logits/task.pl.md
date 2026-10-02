---
description: Policz dokładność logitów sieci względem prawdziwych klas, jako ułamek obrazów, które rozpoznała dobrze.
---

# Dokładność z logitów

[Trening](../../../../notes/05-pytorch/09-classifying-images.pl.md#trening) mierzył sieć przez `torchmetrics.Accuracy`. Dokończ `accuracy(logits, labels)`, które robi to samo dla jednej porcji, bez biblioteki: zwraca ułamek obrazów, w których największy logit należy do właściwej klasy, jako zwykłą liczbę Pythona. `logits` ma kształt `[pictures, classes]`, a `labels` kształt `[pictures]`, z numerem klasy dla każdego obrazu.

| Wywołanie, z logitami 4 obrazów i 3 klas | Zwraca |
| ---------------------------------------- | ------ |
| właściwe klasy to 0, 2, 2 i 0            | `0.75` |
| klasy 0, 2, 1 i 0                        | `1.0`  |
| klasy 1, 1, 0 i 1                        | `0.0`  |

Największe logity czterech obrazów są w klasach 0, 2, 1 i 0, więc drugi zestaw etykiet trafia we wszystkie 4, a pierwszy w 3: najlepsza klasa trzeciego obrazu to 1, a jest oznaczony jako 2. [`argmax(dim=1)`](../../../../notes/05-pytorch/09-classifying-images.pl.md#odczytywanie-odpowiedzi) wybiera klasę dla każdego obrazu, porównanie dwóch tensorów przez `==` daje `True` albo `False` dla każdego, a średnia z nich, gdy staną się liczbami, to ułamek `True`. `.item()` wyjmuje liczbę z tensora.
