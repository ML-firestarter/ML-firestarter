---
description: Pobierz z autogradu nachylenia straty prostej i wykonaj z ich pomocą kroki spadku gradientu.
---

# Zejdź po zboczu straty

*Korzysta z lekcji [Autograd](../../../../notes/05-pytorch/02-autograd.pl.md), z której przydadzą się `backward()`, `no_grad()` i zerowanie nachyleń, oraz z lekcji [Tensory](../../../../notes/05-pytorch/01-tensors.pl.md), z której przyda się `mean()`.*

`km` i `fares` to cztery kursy dzienne z lekcji. Strata prostej z wagą `w` i wyrazem wolnym `b` to średnia kwadratów błędów, `((w * km + b - fares) ** 2).mean()`. Dokończ dwie funkcje:

- `loss_slopes(w, b)` zwraca nachylenia straty względem `w` i `b` jako listę dwóch zwykłych liczb zaokrąglonych do 4 miejsc po przecinku.
- `descend(w, b, learning_rate, steps)` zaczyna od `w` i `b`, wykonuje `steps` kroków spadku gradientu i zwraca nowe `w` i `b` jako listę dwóch liczb zaokrąglonych do 3 miejsc po przecinku.

| Wywołanie                       | Zwraca            |
| ------------------------------- | ----------------- |
| `loss_slopes(0.0, 0.0)`         | `[-280.0, -50.0]` |
| `descend(0.0, 0.0, 0.01, 1)`    | `[2.8, 0.5]`      |
| `descend(0.0, 0.0, 0.01, 5000)` | `[3.0, 10.0]`     |

Każdy krok to przejście w przód, przejście wstecz, krok wewnątrz `torch.no_grad()` i wyzerowanie nachyleń. Pierwszy krok od 0 i 0 przesuwa parametry o 0,01 razy ich nachylenia, w przeciwną stronę, a 0,01 × 280 = 2,8.
