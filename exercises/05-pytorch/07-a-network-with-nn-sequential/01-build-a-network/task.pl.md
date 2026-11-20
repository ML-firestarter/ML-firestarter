---
description: Zbuduj sieć z listy rozmiarów warstw, z ReLU między warstwami i bez ReLU po ostatniej.
---

# Zbuduj sieć

W części [Układanie warstw](../../../../notes/05-pytorch/07-a-network-with-nn-sequential.pl.md#układanie-warstw) sieć została wypisana warstwa po warstwie. Dokończ funkcję `make_mlp(sizes)`, która buduje taką sieć na podstawie listy rozmiarów: `sizes[0]` to liczba cech na wejściu, `sizes[-1]` to liczba liczb na wyjściu, a rozmiary pomiędzy to rozmiary warstw ukrytych. Funkcja zwraca `nn.Sequential` z warstwami `nn.Linear`, po jednej dla każdej pary sąsiednich rozmiarów, i z `nn.ReLU()` po każdej warstwie oprócz ostatniej.

| Wywołanie                  | Zwraca                                                             |
| -------------------------- | ------------------------------------------------------------------ |
| `make_mlp([2, 50, 40, 1])` | `Linear(2, 50)`, `ReLU`, `Linear(50, 40)`, `ReLU`, `Linear(40, 1)` |
| `make_mlp([3, 1])`         | samo `Linear(3, 1)`                                                |

Ostatnia warstwa nie ma ReLU, bo daje predykcję, a po ReLU nie mogłaby ona nigdy być ujemna. Testy sprawdzają rodzaje warstw i ich kształty, a także uruchamiają sieć na tabelach wierszy, więc rozmiary sąsiednich warstw muszą do siebie pasować. Warstwy utworzysz w pętli po parach rozmiarów, `sizes[i]` i `sizes[i + 1]`, dodając ReLU po każdej warstwie, która nie jest ostatnia.
