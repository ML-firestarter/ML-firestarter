---
description: Podziel kursy na trzy zbiory, standaryzuj cechy według zbioru treningowego i utwórz loader dla każdego zbioru.
---

# Loadery dla trzech zbiorów

*Korzysta z lekcji [Tensory](../../../../notes/05-pytorch/01-tensors.pl.md), z której przydadzą się wycinki i standaryzacja, oraz z lekcji [Porcje danych i ocena](../../../../notes/05-pytorch/06-batches-and-evaluation.pl.md), z której przydadzą się zbiory danych i loadery.*

`X` to cechy 120 kursów, z kolumnami dla kilometrów i minut, a `y` to ich opłaty. Dokończ funkcję `make_loaders(X, y, n_train, n_valid, batch_size)`, która zwraca trzy obiekty `DataLoader`: dla zbioru treningowego, walidacyjnego i testowego.

1. Zbiór treningowy to pierwsze `n_train` kursów, walidacyjny to kolejne `n_valid`, a testowy to cała reszta.
2. Cechy wszystkich trzech zbiorów standaryzuje się **średnią i odchyleniem standardowym zbioru treningowego**, liczonymi przez `std(correction=0)` osobno dla każdej kolumny. Etykiety zostają bez zmian.
3. Każdy loader powstaje z `TensorDataset` z cechami i etykietami swojego zbioru, z porcjami po `batch_size`. Dane tasuje tylko loader treningowy.

| Wywołanie                        | Zwraca                                             |
| -------------------------------- | -------------------------------------------------- |
| `make_loaders(X, y, 80, 20, 16)` | loadery z 5, 2 i 2 porcjami dla 80, 20 i 20 kursów |

Zbiory walidacyjny i testowy trzeba standaryzować liczbami policzonymi bez ich udziału, bo inaczej informacja z nich przeciekłaby do treningu. Testy sprawdzają rozmiary, średnią i rozrzut cech treningowych, pierwsze wiersze zbioru walidacyjnego i rodzaj każdego loadera.
