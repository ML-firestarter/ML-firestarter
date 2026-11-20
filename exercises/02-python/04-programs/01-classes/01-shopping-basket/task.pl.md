---
description: Napisz koszyk zakupowy, który sam liczy swoją sumę, i zbuduj na nim koszyk ze zniżką.
---

# Koszyk zakupowy

Napisz dwie klasy. `Basket` przechowuje zakupy, a `DiscountBasket` to `Basket`, który odejmuje od sumy podany procent.

**`Basket()`** na początku jest pusty i ma takie metody:

1. `add(name, price, quantity=1)` wkłada do koszyka `quantity` sztuk towaru i zwraca sam koszyk, żeby wywołania można było łączyć w łańcuch. Ilość mniejsza od 1 zgłasza `ValueError`.
2. `count()` mówi, ile rzeczy jest w koszyku, licząc każdą sztukę osobno, więc 2 ciastka to 2 rzeczy.
3. `total()` zwraca sumę iloczynów ceny i ilości dla wszystkiego, co dodano.
4. Wypisanie koszyka albo wywołanie na nim `repr()` daje `Basket(items=3, total=11)`, z liczbami tego koszyka.

**`DiscountBasket(percent)`** to `Basket`, który zapamiętuje `percent`, a jego `total()` to suma koszyka pomniejszona o ten procent. Nie powtarza tego, co robi `Basket`: `add()` i `count()` dziedziczy po `Basket`, a jego `total()` korzysta z `total()` klasy `Basket`.

| Wywołanie                                                    | Daje                          |
| ------------------------------------------------------------ | ----------------------------- |
| `Basket().add("tea", 3).add("cake", 4, 2).total()`           | `11`                          |
| `Basket().add("tea", 3).add("cake", 4, 2).count()`           | `3`                           |
| `repr(Basket().add("tea", 3).add("cake", 4, 2))`             | `'Basket(items=3, total=11)'` |
| `Basket().add("tea", 3, 0)`                                  | zgłasza `ValueError`          |
| `DiscountBasket(50).add("tea", 3).add("cake", 4, 2).total()` | `5.5`                         |

Każdy koszyk ma własną listę: nowy `Basket()` jest pusty, cokolwiek włożono do wcześniejszych koszyków. Uważaj też na `add()`: bez `return self` na końcu zwraca `None` i wywołania połączone w łańcuch przestają działać.
