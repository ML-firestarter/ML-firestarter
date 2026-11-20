---
description: Napisz moduł szeroki i głęboki, który przyjmuje dwa wejścia, jedno przepuszcza przez mały stos głęboki i skleja oba przed warstwą wyjściową.
---

# Model szeroki i głęboki

W lekcji [Własne moduły](../../../../notes/05-pytorch/08-your-own-modules.pl.md#dwa-wejścia) powstał moduł, który przyjmuje dwa tensory. Dokończ moduł `WideAndDeep(n_wide, n_deep, hidden=8)` tego samego rodzaju, z mniejszą ścieżką głęboką:

1. `n_wide` to liczba kolumn wejścia szerokiego, a `n_deep` wejścia głębokiego.
2. `self.deep_stack` to `nn.Sequential` z `nn.Linear(n_deep, hidden)` i `nn.ReLU()`.
3. `self.output_layer` to `nn.Linear`, które przyjmuje kolumny szerokie i `hidden` liczb ze ścieżki głębokiej, ułożone obok siebie w tej kolejności, i daje 1 liczbę.
4. `forward(X_wide, X_deep)` przepuszcza `X_deep` przez stos głęboki, skleja `X_wide` z wynikiem przez `torch.cat(..., dim=1)` i zwraca to, co da warstwa wyjściowa.

| Wywołanie                                               | Zwraca                      |
| ------------------------------------------------------- | --------------------------- |
| `WideAndDeep(2, 3, hidden=4)`, jego parametry           | 23 liczby w 4 tensorach     |
| `WideAndDeep(2, 3)(torch.ones(7, 2), torch.ones(7, 3))` | tensor o kształcie `[7, 1]` |

Testy liczą parametry i sprawdzają ich kształty, a także ustawiają wagi ręcznie, żeby zobaczyć, którędy biegnie każda ścieżka: gdy wagi ścieżki głębokiej są zerowe, wyjście musi zależeć tylko od kolumn szerokich, i na odwrót. Uważaj na kolejność w `torch.cat` i wywołaj `super().__init__()` przed utworzeniem pierwszej warstwy.
