---
description: Zrób sieć z listy rozmiarów warstw, z ReLU między warstwami i bez ReLU po ostatniej.
---

# Zbuduj sieć

[Układanie warstw](../../../../notes/05-pytorch/07-a-network-with-nn-sequential.pl.md#układanie-warstw) wypisało sieć warstwa po warstwie. Dokończ `make_mlp(sizes)`, które robi taką samą sieć z listy rozmiarów: `sizes[0]` to liczba cech na wejściu, `sizes[-1]` liczba liczb na wyjściu, a te pomiędzy to rozmiary warstw ukrytych. Zwraca `nn.Sequential` z warstw `nn.Linear`, po jednej dla każdej pary sąsiednich rozmiarów, z `nn.ReLU()` po każdej warstwie oprócz ostatniej.

| Wywołanie                  | Zwraca                                                             |
| -------------------------- | ------------------------------------------------------------------ |
| `make_mlp([2, 50, 40, 1])` | `Linear(2, 50)`, `ReLU`, `Linear(50, 40)`, `ReLU`, `Linear(40, 1)` |
| `make_mlp([3, 1])`         | samo `Linear(3, 1)`                                                |

Ostatnia warstwa nie ma ReLU, bo daje predykcję, a ReLU nigdy nie pozwoliłby jej być ujemną. Testy sprawdzają rodzaje warstw i ich kształty oraz uruchamiają sieć na tabelach wierszy, więc rozmiary warstw muszą się spotykać. Pętla po parach rozmiarów, `sizes[i]` i `sizes[i + 1]`, tworzy warstwy, a ReLU dochodzi, o ile to nie ostatnia.
