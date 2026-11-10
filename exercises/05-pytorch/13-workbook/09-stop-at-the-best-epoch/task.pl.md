---
description: Trenuj, aż strata walidacyjna przestanie się poprawiać, a potem wróć do wag najlepszej epoki.
---

# Zatrzymaj się na najlepszej epoce

*Korzysta z [Porcje danych i ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md) dla epok i walidacji oraz [Zapis, wczytywanie i strojenie](../../../../notes/05-pytorch/10-saving-loading-and-tuning.pl.md) dla słowników stanu, które zachowują i przywracają wagi.*

Model trenowany zbyt długo uczy się szumu zbioru treningowego i jego strata walidacyjna zaczyna rosnąć. **Wczesne zatrzymanie** (ang. early stopping) kończy trening, gdy to się dzieje, i zachowuje wagi najlepszej epoki. Dokończ `fit_with_patience(model, run_epoch, validate, max_epochs, patience)`:

- `run_epoch(model)` trenuje model przez jedną epokę, a `validate(model)` daje jego stratę walidacyjną jako zwykłą liczbę. To argumenty, żeby można było użyć dowolnego treningu.
- Epoki są numerowane od 1. Po każdej `validate` daje stratę. Jest najlepszą dotąd, gdy jest **niższa** niż każda wcześniejsza.
- Gdy `patience` epok z rzędu nie miało nowej najlepszej straty, trening się zatrzymuje. Zatrzymuje się też po `max_epochs` epokach.
- Na końcu model dostaje wagi, które miał w najlepszej epoce, skopiowane przez `state_dict()` w tamtym momencie, a nie tylko wskazane. Funkcja zwraca `[best_epoch, best_loss]`, ze stratą zaokrągloną do 4 miejsc po przecinku.

| Wywołanie, z modelem, którego waga rośnie o 1 co epokę, od 0, i stratą `abs(weight - 3)` | Zwraca i co się dzieje                                          |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `fit_with_patience(model, run_epoch, validate, 10, 2)`                                   | `[3, 0.0]`, po 5 epokach, z wagą z powrotem na 3.0              |
| to samo z `patience` 5                                                                   | `[3, 0.0]`, po 8 epokach                                        |

Straty to 2, 1, 0, 1, 2, 3, więc najlepsza jest trzecia epoka. Przy cierpliwości 2 epoki 4 i 5 to dwie, które nie poprawiają, i trening zatrzymuje się po piątej.

> [!TIP]
> `model.state_dict()` wskazuje własne tensory modelu, które zmieniają kolejne epoki. Zachowaj kopię: `{name: value.clone() for name, value in model.state_dict().items()}`.
