---
description: Policz naraz opłaty za wiele kursów, z uwzględnieniem minimum, i udział opłat powyżej limitu.
---

# Opłata początkowa i minimum

*Korzysta z lekcji [Tensory](../../../../notes/05-pytorch/01-tensors.pl.md), z której przydadzą się działania arytmetyczne, `clamp()` i porównania na całych tensorach.*

Taksówka liczy `per_km` za każdy kilometr i `fee` za start, ale nigdy mniej niż `minimum`. Dokończ dwie funkcje, które działają na wszystkich kursach z tensora naraz, bez pętli:

- `fares_with_fee(km, per_km, fee, minimum)` zwraca tensor opłat za kursy z `km`: `km * per_km + fee`, ale nie mniej niż `minimum`. Odległości mogą być liczbami całkowitymi albo dziesiętnymi, a funkcja działa też dla tabeli o dowolnym kształcie.
- `share_above(fares, limit)` zwraca jako zwykłą liczbę udział opłat większych niż `limit`, na przykład 0,5, gdy jest to połowa z nich.

| Wywołanie                                                       | Zwraca                   |
| --------------------------------------------------------------- | ------------------------ |
| `fares_with_fee(torch.tensor([1.0, 5.0, 10.0]), 2.0, 3.0, 8.0)` | `tensor([8., 13., 23.])` |
| `share_above(torch.tensor([5.0, 10.0, 20.0, 30.0]), 12.0)`      | `0.5`                    |

> [!TIP]
> Porównanie takie jak `fares > limit` daje tensor wartości `True` i `False`. `.float()` zamienia je na jedynki i zera, a średnia z nich to właśnie szukany udział.
