---
description: Wybierz między kartą graficzną, układem Apple i procesorem, dla dowolnego komputera, tak jak program wybiera swoje urządzenie.
---

# Wybierz urządzenie

[Wybór urządzenia](../../../../notes/05-pytorch/03-devices.pl.md#wybór-urządzenia) zapytał PyTorcha, jakie urządzenia ma komputer, i wziął najlepsze. Dokończ `choose_device(cuda_available, mps_available)`, które dokonuje wyboru na podstawie dwóch odpowiedzi, które dostaje, żeby można je było wypróbować na każdym rodzaju komputera, także na tych, których tu nie ma. Zwraca `"cuda"`, gdy dostępna jest karta NVIDIA, w przeciwnym razie `"mps"`, gdy dostępny jest układ Apple, a gdy żadne z nich, `"cpu"`.

`get_device()` jest gotowe: zadaje PyTorchowi dwa pytania i wywołuje `choose_device`.

| Wywołanie                     | Zwraca   |
| ----------------------------- | -------- |
| `choose_device(False, False)` | `"cpu"`  |
| `choose_device(True, False)`  | `"cuda"` |
| `choose_device(False, True)`  | `"mps"`  |
| `choose_device(True, True)`   | `"cuda"` |

Komputer zarówno z kartą NVIDIA, jak i układem Apple jest rzadki, ale karta idzie pierwsza. Zwracaj nazwy jako tekst, jak `"cuda"`, bo takie przyjmują `.to(...)` i `device=`.
