---
description: Zamień obraz zapisany w liczbach całkowitych, z kanałami na końcu, na tensor liczb zmiennoprzecinkowych, jakiego oczekuje sieć, i z powrotem.
---

# Obraz jako tensor

W części [Obraz jako tensor](../../../../notes/05-pytorch/01-tensors.pl.md#obraz-jako-tensor) obraz w postaci, w jakiej przechowują go pliki, został zamieniony na to, czego oczekują warstwy PyTorcha, i z powrotem. Dokończ dwie funkcje, które robią to dla dowolnego obrazu:

- `to_tensor(picture)` przyjmuje tensor typu `uint8` o kształcie `[wysokość, szerokość, kanały]`, z liczbami od 0 do 255, i zwraca tensor typu `float32` o kształcie `[kanały, wysokość, szerokość]`, z liczbami od 0 do 1.
- `to_picture(x)` działa w drugą stronę: przyjmuje liczby zmiennoprzecinkowe o kształcie `[kanały, wysokość, szerokość]` i zwraca tensor typu `uint8` o kształcie `[wysokość, szerokość, kanały]`. Liczba mniejsza od 0 liczy się jako 0, a większa od 1 jako 1. Pozostałe są mnożone przez 255 i zaokrąglane do najbliższej liczby całkowitej.

| Wywołanie, gdy `picture` ma 1 piksel wysokości i 2 szerokości: czerwony `[255, 0, 0]` i niebieskozielony `[0, 128, 255]` | Zwraca                                                                 |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `to_tensor(picture)`                                                                                                     | `tensor([[[1.0000, 0.0000]], [[0.0000, 0.5020]], [[0.0000, 1.0000]]])` |
| `to_tensor(picture).shape`                                                                                               | `torch.Size([3, 1, 2])`                                                |
| `to_picture(to_tensor(picture))`                                                                                         | to samo co `picture`                                                   |

Tensor ma osobną tabelę dla każdego kanału: najpierw czerwień obu pikseli, 1 i 0, potem ich zieleń, 0 i 0,502, a na końcu niebieski, 0 i 1.

Jeśli kształty się zgadzają, a liczby są w złych miejscach, wymiary zostały podzielone na nowo przez `reshape`, a trzeba je było przestawić przez `permute`. Jeśli `to_picture` daje 63 tam, gdzie sprawdzenia oczekują 64, liczby zmiennoprzecinkowe zamieniono na całkowite bez `round()`, a konwersja odcina część po przecinku. A jeśli liczba większa od 1 nie wychodzi jako 255, przed konwersją zabrakło `clamp`.
