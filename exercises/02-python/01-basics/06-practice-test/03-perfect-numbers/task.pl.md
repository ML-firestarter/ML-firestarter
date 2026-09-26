---
description: Znajdź liczby, które są sumą własnych dzielników.
---

# Liczby doskonałe

*Korzysta z lekcji [Zakresy i listy](../../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md) i [Warunki i funkcje](../../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md).*

Dzielnik liczby dzieli ją bez reszty: dzielniki 12 to 1, 2, 3, 4, 6 i 12. Liczba jest doskonała, gdy jest sumą swoich dzielników mniejszych od niej samej: 6 to 1 + 2 + 3, a 28 to 1 + 2 + 4 + 7 + 14. Liczba 1 nie jest doskonała, bo nie ma dzielników mniejszych od siebie. Napisz trzy funkcje:

- `divisors(n)` zwraca listę dzielników `n` mniejszych od `n`, od najmniejszego.
- `is_perfect(n)` zwraca `True`, gdy `n` jest doskonała, a w przeciwnym razie `False`.
- `perfect_numbers(limit)` zwraca listę liczb doskonałych od 1 do `limit`, łącznie z nimi.

`sum()` dodaje liczby z listy: `sum([1, 2, 3])` to `6`, a `sum([])` to `0`.

| Wywołanie              | Zwraca            |
| ---------------------- | ----------------- |
| `divisors(12)`         | `[1, 2, 3, 4, 6]` |
| `divisors(7)`          | `[1]`             |
| `is_perfect(28)`       | `True`            |
| `is_perfect(12)`       | `False`           |
| `perfect_numbers(100)` | `[6, 28]`         |
