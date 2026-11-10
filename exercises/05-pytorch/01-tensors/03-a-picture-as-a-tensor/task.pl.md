---
description: Zamień obraz z liczb całkowitych, z kanałami na końcu, w tensor liczb zmiennoprzecinkowych, który bierze sieć, i z powrotem.
---

# Obraz jako tensor

Część [Obraz jako tensor](../../../../notes/05-pytorch/01-tensors.pl.md#obraz-jako-tensor) zamieniła obraz w postaci, w jakiej trzymają go pliki, w to, co biorą warstwy PyTorcha, i z powrotem. Dokończ dwie funkcje, które robią to dla dowolnego obrazu:

- `to_tensor(picture)` bierze tensor `uint8` o kształcie `[wysokość, szerokość, kanały]`, z liczbami od 0 do 255, i zwraca tensor `float32` o kształcie `[kanały, wysokość, szerokość]`, z liczbami od 0 do 1.
- `to_picture(x)` idzie w drugą stronę: bierze liczby zmiennoprzecinkowe o kształcie `[kanały, wysokość, szerokość]` i zwraca tensor `uint8` o kształcie `[wysokość, szerokość, kanały]`. Liczba poniżej 0 liczy się jako 0, a powyżej 1 jako 1. Pozostałe są mnożone przez 255 i zaokrąglane do najbliższej liczby całkowitej.

| Wywołanie, z `picture` o wysokości 1 piksela i szerokości 2, z pikselem czerwonym `[255, 0, 0]` i niebieskozielonym `[0, 128, 255]` | Zwraca                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `to_tensor(picture)`                                                                                                                | `tensor([[[1.0000, 0.0000]], [[0.0000, 0.5020]], [[0.0000, 1.0000]]])` |
| `to_tensor(picture).shape`                                                                                                          | `torch.Size([3, 1, 2])`                                         |
| `to_picture(to_tensor(picture))`                                                                                                    | to samo co `picture`                                            |

Tensor ma tabelę dla każdego kanału: czerwony obu pikseli, 1 i 0, potem ich zielony, 0 i 0,502, potem ich niebieski, 0 i 1.

Jeśli kształty są dobre, a liczby w złych miejscach, wymiary pocięto od nowa przez `reshape`, a trzeba je było przestawić przez `permute`. Jeśli `to_picture` daje 63 tam, gdzie sprawdzenia oczekują 64, liczby zmiennoprzecinkowe zamieniono na całkowite bez `round()`, co obcina to, co po przecinku. A jeśli liczba powyżej 1 nie wychodzi jako 255, nie sprowadzono jej przez `clamp` przed zamianą.
