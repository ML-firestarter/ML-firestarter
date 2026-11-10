---
description: Podziel kursy na trzy zbiory, ustandaryzuj cechy według zbioru treningowego i zrób loader dla każdego.
---

# Loadery dla trzech zbiorów

*Korzysta z [Tensory](../../../../notes/05-pytorch/01-tensors.pl.md) dla wycinków i standaryzacji oraz [Porcje danych i ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md) dla zbiorów danych i loaderów.*

`X` to cechy 120 kursów, w kolumnach dla kilometrów i minut, a `y` to ich opłaty. Dokończ `make_loaders(X, y, n_train, n_valid, batch_size)`, które zwraca trzy `DataLoader`y, dla zbiorów treningowego, walidacyjnego i testowego:

1. Zbiór treningowy to pierwsze `n_train` kursów, walidacyjny następne `n_valid`, a testowy cała reszta.
2. Cechy wszystkich trzech są standaryzowane **średnią i odchyleniem standardowym zbioru treningowego**, liczonymi z `std(correction=0)`, osobno dla kolumn. Etykiety zostają, jakie są.
3. Każdy loader powstaje z `TensorDataset` cech i etykiet jego zbioru, z porcjami po `batch_size`. Tylko loader treningowy tasuje.

| Wywołanie                         | Zwraca                                                              |
| --------------------------------- | ------------------------------------------------------------------- |
| `make_loaders(X, y, 80, 20, 16)`  | loadery po 5, 2 i 2 porcje, dla 80, 20 i 20 kursów                  |

Zbiory walidacyjny i testowy trzeba standaryzować liczbami, do których nie przyłożyły ręki, bo inaczej zbiór treningowy przeciekłby do nich. Testy patrzą na rozmiary, na średnią i rozrzut cech treningowych, na pierwsze wiersze walidacyjne i na rodzaj każdego loadera.
