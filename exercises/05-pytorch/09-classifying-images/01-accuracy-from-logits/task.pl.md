---
description: Policz dokładność logitów sieci względem prawdziwych klas, czyli ułamek obrazów, które sieć rozpoznała poprawnie.
---

# Dokładność z logitów

W części [Trening](../../../../notes/05-pytorch/09-classifying-images.pl.md#trening) sieć była mierzona przez `torchmetrics.Accuracy`. Dokończ funkcję `accuracy(logits, labels)`, która robi to samo dla jednej porcji, bez biblioteki: zwraca ułamek obrazów, dla których największy logit należy do właściwej klasy, jako zwykłą liczbę Pythona. `logits` ma kształt `[pictures, classes]`, a `labels` kształt `[pictures]`, z numerem klasy dla każdego obrazu.

| Wywołanie dla logitów 4 obrazów i 3 klas | Zwraca |
| ---------------------------------------- | ------ |
| właściwe klasy to 0, 2, 2 i 0            | `0.75` |
| klasy 0, 2, 1 i 0                        | `1.0`  |
| klasy 1, 1, 0 i 1                        | `0.0`  |

Największe logity czterech obrazów są w klasach 0, 2, 1 i 0, więc drugi zestaw etykiet zgadza się dla wszystkich czterech obrazów, a pierwszy dla trzech: najlepsza klasa trzeciego obrazu to 1, a jego etykieta to 2. [`argmax(dim=1)`](../../../../notes/05-pytorch/09-classifying-images.pl.md#odczytywanie-odpowiedzi) wybiera klasę dla każdego obrazu, porównanie dwóch tensorów przez `==` daje `True` albo `False` dla każdego z nich, a średnia z tych wartości zamienionych na liczby to ułamek `True`. `.item()` wyjmuje liczbę z tensora.
