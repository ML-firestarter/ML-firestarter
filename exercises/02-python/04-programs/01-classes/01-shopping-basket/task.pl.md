---
description: Napisz koszyk z zakupami, który podlicza swoją sumę, i koszyk ze zniżką zbudowany na nim.
---

# Koszyk z zakupami

Napisz dwie klasy. `Basket` trzyma zakupy, a `DiscountBasket` to `Basket`, który odejmuje od sumy procent.

**`Basket()`** zaczyna pusty i ma takie metody:

1. `add(name, price, quantity=1)` wkłada do koszyka `quantity` sztuk towaru i zwraca sam koszyk, żeby można było łączyć wywołania w łańcuch. Ilość mniejsza niż 1 zgłasza `ValueError`.
2. `count()` podaje, ile rzeczy jest w koszyku, licząc każdą sztukę z ilości, więc 2 ciastka to 2 rzeczy.
3. `total()` podaje sumę ceny razy ilość po wszystkim, co dodano.
4. Wypisanie koszyka albo `repr()` na nim daje `Basket(items=3, total=11)`, z jego własnymi liczbami.

**`DiscountBasket(percent)`** to `Basket`, który zapamiętuje `percent`, a jego `total()` to suma koszyka z odjętym tym procentem. Nie powtarza tego, co robi `Basket`: `add()` i `count()` pochodzą z `Basket`, a `total()` opiera się na `total()` z `Basket`.

| Wywołanie                                                    | Daje                          |
| ------------------------------------------------------------ | ----------------------------- |
| `Basket().add("tea", 3).add("cake", 4, 2).total()`           | `11`                          |
| `Basket().add("tea", 3).add("cake", 4, 2).count()`           | `3`                           |
| `repr(Basket().add("tea", 3).add("cake", 4, 2))`             | `'Basket(items=3, total=11)'` |
| `Basket().add("tea", 3, 0)`                                  | zgłasza `ValueError`          |
| `DiscountBasket(50).add("tea", 3).add("cake", 4, 2).total()` | `5.5`                         |

Każdy koszyk ma własną listę: nowy `Basket()` jest pusty, cokolwiek włożono do koszyków przed nim. I uważaj na `add()`: bez `return self` na końcu zwraca `None`, a połączone w łańcuch wywołania się psują.
