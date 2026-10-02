---
description: Napisz moduł szeroki i głęboki, który bierze dwa wejścia, jedno puszcza przez mały stos głęboki i skleja oba przed warstwą wyjściową.
---

# Model szeroki i głęboki

[Własne moduły](../../../../notes/05-pytorch/08-your-own-modules.pl.md#dwa-wejścia) napisały moduł, który bierze dwa tensory. Dokończ `WideAndDeep(n_wide, n_deep, hidden=8)`, moduł tego samego rodzaju z mniejszą ścieżką głęboką:

1. `n_wide` to liczba kolumn wejścia szerokiego, a `n_deep` głębokiego.
2. `self.deep_stack` to `nn.Sequential` z `nn.Linear(n_deep, hidden)` i `nn.ReLU()`.
3. `self.output_layer` to `nn.Linear`, które bierze kolumny szerokie i `hidden` liczb ścieżki głębokiej, obok siebie, w tej kolejności, i daje 1 liczbę.
4. `forward(X_wide, X_deep)` puszcza `X_deep` przez stos głęboki, skleja `X_wide` i wynik przez `torch.cat(..., dim=1)` i zwraca to, co da warstwa wyjściowa.

| Wywołanie                                                     | Zwraca                                   |
| ------------------------------------------------------------- | ---------------------------------------- |
| `WideAndDeep(2, 3, hidden=4)`, jego parametry                 | 23 liczby, w 4 tensorach                 |
| `WideAndDeep(2, 3)(torch.ones(7, 2), torch.ones(7, 3))`       | tensor o kształcie `[7, 1]`              |

Testy liczą parametry, patrzą na ich kształty, a także ustawiają wagi ręcznie, żeby zobaczyć, dokąd idzie każda ścieżka: gdy wagi ścieżki głębokiej są równe 0, wyjście musi składać się z samych kolumn szerokich, i na odwrót. Uważaj na kolejność w `torch.cat` i wywołaj `super().__init__()` przed pierwszą warstwą.
