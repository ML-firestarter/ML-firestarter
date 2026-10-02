---
description: Zdecyduj, czy wersja pakietu spełnia specyfikator wersji taki jak >=2.0,<3.
---

# Czy pasuje

*Korzysta z lekcji [Python na twoim komputerze](../../../../notes/02-python/04-programs/03-python-on-your-computer.pl.md) dla specyfikatorów wersji oraz [Warunki i funkcje](../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md) i [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md) dla porównań i pętli.*

`uv add "numpy>=2.0,<3"` prosi o wersję numpy, która jest co najmniej 2.0 i poniżej 3. Dokończ `allows(specifier, version)`, które mówi, czy wersja pasuje do specyfikatora. Kod daje ci `parse_version("2.4.6")`, które zamienia wersję na krotkę `(2, 4, 6)`, a krotki porównuje się liczba po liczbie.

- Specyfikator to klauzule rozdzielone przecinkami, jak `">=2.0,<3"`. Wersja pasuje tylko wtedy, gdy pasuje do **każdej** klauzuli. Spacje wokół klauzuli nie mają znaczenia, a pusty specyfikator pasuje do każdej wersji.
- Klauzula to operator i wersja: `>=`, `<=`, `==`, `!=`, `>` albo `<`. Każdy inny operator, jak `~=`, zgłasza `ValueError`.
- Wersje z inną liczbą części porównuje się tak, jakby krótsza kończyła się zerami: `2.4` to ta sama wersja co `2.4.0`.
- Wersje porównuje się jako liczby, a nie jako tekst, więc `1.10` jest powyżej `1.9`.

| Wywołanie                     | Zwraca  |
| ----------------------------- | ------- |
| `allows(">=2.0,<3", "2.4.6")` | `True`  |
| `allows(">=2.0,<3", "3.0")`   | `False` |
| `allows("==2.4", "2.4.0")`    | `True`  |
| `allows(">=1.9", "1.10")`     | `True`  |
| `allows("~=2.0", "2.1")`      | zgłasza `ValueError` |

> [!TIP]
> Dopełnij obie krotki zerami do tej samej długości, jak w `have + (0,) * (size - len(have))`, i porównaj je operatorem klauzuli.
