---
description: Przenieś wszystkie tensory porcji danych na urządzenie, zachowując krotkę albo listę, którą była porcja.
---

# Przenieś porcję danych

Porcja danych treningowych to zwykle kilka tensorów, jak cechy i etykiety, w krotce albo na liście, a wszystkie muszą leżeć na urządzeniu modelu. Jak mówi część [Przenoszenie tensorów](../../../../notes/05-pytorch/03-devices.pl.md#przenoszenie-tensorów), `.to(device)` daje kopię jednego tensora na urządzeniu. Dokończ `to_device(batch, device)`, które zwraca tensory `batch` na `device`, w tej samej kolejności, w krotce, gdy `batch` był krotką, i na liście, gdy był listą. `device` to nazwa, jak `"cpu"`, albo `torch.device`.

| Wywołanie                     | Zwraca                                   |
| ----------------------------- | ---------------------------------------- |
| `to_device((X, y), "cpu")`    | krotkę z `X` i `y`, oba na CPU           |
| `to_device([a, b, c], "cpu")` | listę z `a`, `b` i `c`, wszystkie na CPU |

Tu nie ma GPU, więc testy używają `"cpu"` i sprawdzają liczby, kolejność i rodzaj kontenera. Na komputerze z kartą graficzną `to_device(batch, "cuda")` to to, co pętla treningowa wywołuje dla każdej porcji. Jeśli twoja funkcja oddaje listę, gdy dostała krotkę, wynik `X, y = to_device((X, y), ...)` nadal się rozpakuje, ale testy sprawdzają rodzaj.
