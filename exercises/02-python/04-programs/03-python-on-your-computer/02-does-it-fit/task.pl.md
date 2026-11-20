---
description: Sprawdź, czy wersja pakietu spełnia specyfikator wersji taki jak >=2.0,<3.
---

# Czy wersja pasuje?

*Korzysta z lekcji [Python na twoim komputerze](../../../../notes/02-python/04-programs/03-python-on-your-computer.pl.md), z której przydadzą się specyfikatory wersji, oraz z lekcji [Warunki i funkcje](../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md) i [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md), z których przydadzą się porównania i pętle.*

`uv add "numpy>=2.0,<3"` prosi o wersję numpy co najmniej 2.0, ale niższą niż 3. Dokończ funkcję `allows(specifier, version)`, która mówi, czy wersja spełnia specyfikator. `parse_version("2.4.6")`, które jest już w kodzie, zamienia wersję na krotkę `(2, 4, 6)`, a krotki porównuje się liczba po liczbie.

- Specyfikator to warunki rozdzielone przecinkami, na przykład `">=2.0,<3"`. Wersja go spełnia tylko wtedy, gdy spełnia **każdy** warunek. Spacje wokół warunku nie mają znaczenia, a pusty specyfikator spełnia każda wersja.
- Warunek to operator i wersja, a operator to `>=`, `<=`, `==`, `!=`, `>` albo `<`. Każdy inny operator, na przykład `~=`, zgłasza `ValueError`.
- Wersje o różnej liczbie części porównuje się tak, jakby krótsza kończyła się zerami: `2.4` to ta sama wersja co `2.4.0`.
- Wersje porównuje się jak liczby, a nie jak tekst, więc `1.10` jest wyższa niż `1.9`.

| Wywołanie                     | Zwraca               |
| ----------------------------- | -------------------- |
| `allows(">=2.0,<3", "2.4.6")` | `True`               |
| `allows(">=2.0,<3", "3.0")`   | `False`              |
| `allows("==2.4", "2.4.0")`    | `True`               |
| `allows(">=1.9", "1.10")`     | `True`               |
| `allows("~=2.0", "2.1")`      | zgłasza `ValueError` |

> [!TIP]
> Dopełnij obie krotki zerami do tej samej długości, na przykład przez `have + (0,) * (size - len(have))`, i porównaj je operatorem z warunku.
