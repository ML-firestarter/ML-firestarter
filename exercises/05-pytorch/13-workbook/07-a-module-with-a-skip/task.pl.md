---
description: Napisz jeden moduł, który buduje sieć MLP z listy rozmiarów i potrafi też przekazać wejście prosto do warstwy wyjściowej.
---

# Moduł z połączeniem pomijającym

*Korzysta z lekcji [Sieć z nn.Sequential](../../../../notes/05-pytorch/07-a-network-with-nn-sequential.pl.md), z której przyda się układanie `nn.Linear` i `nn.ReLU`, oraz z lekcji [Własne moduły](../../../../notes/05-pytorch/08-your-own-modules.pl.md), z której przydadzą się moduły i `torch.cat`.*

Dokończ moduł `MLP(sizes, skip=False)`, który na podstawie listy rozmiarów warstw buduje sieci z lekcji 7 i 8:

- `self.deep` to `nn.Sequential` z warstwą `nn.Linear(sizes[i], sizes[i + 1])` i `nn.ReLU()` po niej dla każdej pary sąsiednich rozmiarów oprócz ostatniej. Przy `sizes = [3, 1]` nie ma żadnej takiej pary i `self.deep` jest puste.
- `self.output` to ostatnia warstwa `nn.Linear`. Przyjmuje `sizes[-2]` liczb ze ścieżki głębokiej, a gdy `skip` jest prawdziwe, także `sizes[0]` cech wejścia, umieszczonych przed nimi. Daje `sizes[-1]` liczb.
- `forward(X)` przepuszcza `X` przez `self.deep`. Przy `skip` skleja `X` z wynikiem przez `torch.cat(..., dim=1)`, z `X` na początku. Zwraca to, co da `self.output`.

| Wywołanie                        | Parametry                                                |
| -------------------------------- | -------------------------------------------------------- |
| `MLP([2, 50, 40, 1])`            | 2231                                                     |
| `MLP([2, 50, 40, 1], skip=True)` | 2233, bo warstwa wyjściowa przyjmuje 42 liczby, a nie 40 |
| `MLP([3, 1], skip=True)`         | 7                                                        |

Testy liczą parametry, sprawdzają warstwy i kształt wag warstwy wyjściowej, a także ustawiają wagi ręcznie, żeby sprawdzić, że przy `skip` wyjście może zależeć tylko od wejścia, a bez niego tylko od wyrazu wolnego.
