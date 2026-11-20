---
description: Wybierz między kartą graficzną, układem Apple i procesorem na dowolnym komputerze, tak jak program wybiera swoje urządzenie.
---

# Wybierz urządzenie

W części [Wybór urządzenia](../../../../notes/05-pytorch/03-devices.pl.md#wybór-urządzenia) program zapytał PyTorcha, jakie urządzenia ma komputer, i wybrał najlepsze. Dokończ funkcję `choose_device(cuda_available, mps_available)`, która dokonuje wyboru na podstawie dwóch podanych jej odpowiedzi, dzięki czemu można ją wypróbować dla każdego rodzaju komputera, także takiego, którego tu nie ma. Zwraca `"cuda"`, gdy dostępna jest karta NVIDIA, w przeciwnym razie `"mps"`, gdy dostępny jest układ Apple, a gdy nie ma żadnego z nich, `"cpu"`.

`get_device()` jest już gotowe: zadaje PyTorchowi oba pytania i wywołuje `choose_device`.

| Wywołanie                     | Zwraca   |
| ----------------------------- | -------- |
| `choose_device(False, False)` | `"cpu"`  |
| `choose_device(True, False)`  | `"cuda"` |
| `choose_device(False, True)`  | `"mps"`  |
| `choose_device(True, True)`   | `"cuda"` |

Komputer, który ma i kartę NVIDIA, i układ Apple, to rzadkość, ale w takim przypadku pierwszeństwo ma karta. Zwracaj nazwy jako tekst, na przykład `"cuda"`, bo w takiej postaci przyjmują je `.to(...)` i `device=`.
