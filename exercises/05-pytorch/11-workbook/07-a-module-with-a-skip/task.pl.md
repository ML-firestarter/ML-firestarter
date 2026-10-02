---
description: Napisz jeden moduł, który buduje MLP z listy rozmiarów i potrafi też posłać wejście wprost do warstwy wyjściowej.
---

# Moduł z połączeniem pomijającym

*Korzysta z [Sieć z nn.Sequential](../../../../notes/05-pytorch/07-a-network-with-nn-sequential.pl.md) dla układania `nn.Linear` i `nn.ReLU` oraz [Własne moduły](../../../../notes/05-pytorch/08-your-own-modules.pl.md) dla modułów i `torch.cat`.*

Dokończ `MLP(sizes, skip=False)`, moduł, który robi sieci z lekcji 7 i lekcji 8 z listy rozmiarów warstw:

- `self.deep` to `nn.Sequential` z `nn.Linear(sizes[i], sizes[i + 1])` i `nn.ReLU()` po każdej, dla każdej pary rozmiarów oprócz ostatniej. Przy `sizes = [3, 1]` nie ma żadnej i `self.deep` jest puste.
- `self.output` to ostatnie `nn.Linear`. Bierze `sizes[-2]` liczb ścieżki głębokiej i, gdy `skip` jest prawdziwe, także `sizes[0]` cech wejścia, przed nimi. Daje `sizes[-1]` liczb.
- `forward(X)` puszcza `X` przez `self.deep`. Z `skip` skleja `X` i wynik przez `torch.cat(..., dim=1)`, `X` pierwsze. Zwraca to, co da `self.output`.

| Wywołanie                             | Parametry                     |
| ------------------------------------- | ----------------------------- |
| `MLP([2, 50, 40, 1])`                 | 2231                          |
| `MLP([2, 50, 40, 1], skip=True)`      | 2233: warstwa wyjściowa bierze 42 liczby, nie 40 |
| `MLP([3, 1], skip=True)`              | 7                             |

Testy liczą parametry, patrzą na warstwy i kształt wag warstwy wyjściowej oraz ustawiają wagi ręcznie, żeby zobaczyć, że z `skip` wyjście może składać się z samego wejścia, a bez niego z samego wyrazu wolnego.
