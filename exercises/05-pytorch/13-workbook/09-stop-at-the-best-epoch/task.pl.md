---
description: Trenuj, dopóki strata walidacyjna się poprawia, a potem wróć do wag z najlepszej epoki.
---

# Zatrzymaj się na najlepszej epoce

*Korzysta z lekcji [Porcje danych i ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md), z której przydadzą się epoki i walidacja, oraz z lekcji [Zapis, wczytywanie i strojenie](../../../../notes/05-pytorch/10-saving-loading-and-tuning.pl.md), z której przydadzą się słowniki stanu do zachowywania i przywracania wag.*

Model trenowany zbyt długo uczy się szumu ze zbioru treningowego i jego strata walidacyjna zaczyna rosnąć. **Wczesne zatrzymanie** (ang. early stopping) kończy wtedy trening i zachowuje wagi z najlepszej epoki. Dokończ funkcję `fit_with_patience(model, run_epoch, validate, max_epochs, patience)`:

- `run_epoch(model)` trenuje model przez jedną epokę, a `validate(model)` zwraca jego stratę walidacyjną jako zwykłą liczbę. Przekazuje się je jako argumenty, żeby można było użyć dowolnego treningu.
- Epoki są numerowane od 1. Po każdej epoce `validate` daje stratę. Jest ona najlepsza do tej pory, gdy jest **niższa** od wszystkich wcześniejszych.
- Gdy przez `patience` epok z rzędu nie pojawi się nowa najlepsza strata, trening się zatrzymuje. Zatrzymuje się też po `max_epochs` epokach.
- Na końcu model dostaje wagi, które miał w najlepszej epoce, skopiowane w tamtym momencie przez `state_dict()`, a nie tylko zapamiętane jako odwołanie. Funkcja zwraca `[best_epoch, best_loss]`, ze stratą zaokrągloną do 4 miejsc po przecinku.

| Wywołanie dla modelu, którego waga rośnie od 0 o 1 co epokę, i straty `abs(weight - 3)` | Zwraca i co się dzieje                       |
| --------------------------------------------------------------------------------------- | -------------------------------------------- |
| `fit_with_patience(model, run_epoch, validate, 10, 2)`                                  | `[3, 0.0]` po 5 epokach, a waga wraca do 3.0 |
| to samo przy `patience` równym 5                                                        | `[3, 0.0]` po 8 epokach                      |

Straty to 2, 1, 0, 1, 2, 3, więc najlepsza jest trzecia epoka. Przy cierpliwości 2 epoki 4 i 5 to dwie kolejne epoki bez poprawy, więc trening zatrzymuje się po piątej.

> [!TIP]
> `model.state_dict()` odwołuje się do tensorów samego modelu, które kolejne epoki zmieniają. Zachowaj kopię: `{name: value.clone() for name, value in model.state_dict().items()}`.
