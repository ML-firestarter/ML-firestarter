---
description: Policz naraz opłaty wielu kursów z minimum i udział tych powyżej limitu.
---

# Opłaty z opłatą początkową

*Korzysta z [Tensory](../../../../notes/05-pytorch/01-tensors.pl.md) dla arytmetyki, `clamp()` i porównań na całych tensorach.*

Taksówka liczy `per_km` za każdy kilometr, plus `fee` za wsiadanie, i nigdy mniej niż `minimum`. Dokończ dwie funkcje, które działają na wszystkich kursach tensora naraz, bez pętli:

- `fares_with_fee(km, per_km, fee, minimum)` zwraca tensor opłat kursów z `km`: `km * per_km + fee`, ale co najmniej `minimum`. Kursy mogą być liczbami całkowitymi albo dziesiętnymi, a działa też tabela o dowolnym kształcie.
- `share_above(fares, limit)` zwraca jako zwykłą liczbę udział opłat większych niż `limit`: 0,5, gdy to połowa z nich.

| Wywołanie                                                       | Zwraca                   |
| --------------------------------------------------------------- | ------------------------ |
| `fares_with_fee(torch.tensor([1.0, 5.0, 10.0]), 2.0, 3.0, 8.0)` | `tensor([8., 13., 23.])` |
| `share_above(torch.tensor([5.0, 10.0, 20.0, 30.0]), 12.0)`      | `0.5`                    |

> [!TIP]
> Porównanie takie jak `fares > limit` daje tensor `True` i `False`. `.float()` zamienia go na jedynki i zera, a średnia z nich to ten udział.
