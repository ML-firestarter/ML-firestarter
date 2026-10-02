---
description: Write a basket of shopping that adds up its total, and a discount basket built on it.
---

# Shopping basket

Write two classes. `Basket` holds shopping, and `DiscountBasket` is a `Basket` that takes a percentage off its total.

**`Basket()`** starts empty, and has these methods:

1. `add(name, price, quantity=1)` puts `quantity` of an item in the basket, and returns the basket itself, so that calls can be chained. A quantity below 1 raises a `ValueError`.
2. `count()` gives how many items the basket holds, counting every one of a quantity, so 2 cakes are 2 items.
3. `total()` gives the sum of price times quantity, over everything added.
4. Printing a basket, or calling `repr()` on it, gives `Basket(items=3, total=11)`, with its own numbers.

**`DiscountBasket(percent)`** is a `Basket` that remembers `percent`, and whose `total()` is the basket's total with that percentage taken off. It doesn't repeat what `Basket` does: `add()` and `count()` come from `Basket`, and `total()` builds on `Basket`'s.

| Call                                                      | Gives                         |
| --------------------------------------------------------- | ----------------------------- |
| `Basket().add("tea", 3).add("cake", 4, 2).total()`        | `11`                          |
| `Basket().add("tea", 3).add("cake", 4, 2).count()`        | `3`                           |
| `repr(Basket().add("tea", 3).add("cake", 4, 2))`          | `'Basket(items=3, total=11)'` |
| `Basket().add("tea", 3, 0)`                               | raises `ValueError`           |
| `DiscountBasket(50).add("tea", 3).add("cake", 4, 2).total()` | `5.5`                      |

Each basket has a list of its own: a new `Basket()` is empty, whatever was put in the baskets before it. And mind `add()`: without `return self` at its end, it gives back `None`, and the chained calls fail.
