---
description: Przenieś wszystkie tensory porcji danych na urządzenie, zachowując krotkę albo listę, w której przyszła porcja.
---

# Przenieś porcję danych

Porcja danych treningowych to zwykle kilka tensorów, na przykład cechy i etykiety, w krotce albo na liście, a wszystkie muszą leżeć na tym samym urządzeniu co model. Jak mówi część [Przenoszenie tensorów](../../../../notes/05-pytorch/03-devices.pl.md#przenoszenie-tensorów), `.to(device)` daje kopię jednego tensora na urządzeniu. Dokończ funkcję `to_device(batch, device)`, która zwraca tensory z `batch` przeniesione na `device`, w tej samej kolejności: w krotce, gdy `batch` był krotką, i na liście, gdy był listą. `device` to nazwa, na przykład `"cpu"`, albo `torch.device`.

| Wywołanie                     | Zwraca                                   |
| ----------------------------- | ---------------------------------------- |
| `to_device((X, y), "cpu")`    | krotkę z `X` i `y`, oba na CPU           |
| `to_device([a, b, c], "cpu")` | listę z `a`, `b` i `c`, wszystkie na CPU |

Tutaj nie ma GPU, więc testy używają `"cpu"` i sprawdzają liczby, kolejność i rodzaj pojemnika. Na komputerze z kartą graficzną pętla treningowa wywołuje `to_device(batch, "cuda")` dla każdej porcji. Jeśli twoja funkcja zwraca listę, choć dostała krotkę, `X, y = to_device((X, y), ...)` nadal się rozpakuje, ale testy sprawdzają rodzaj pojemnika.
