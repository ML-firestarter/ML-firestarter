---
description: Wydaj resztę jak najmniejszą liczbą banknotów i monet.
input: 289
---

# Wydawanie reszty

*Korzysta z lekcji [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md), ze względu na `//` i `%`, oraz [Pętle i słowniki](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.pl.md).*

Kasa w sklepie ma banknoty i monety o wartości 100, 50, 20, 10, 5, 2 i 1, po tyle sztuk każdej, ile jej trzeba. Żeby wydać resztę jak najmniejszą liczbą sztuk, bierze tyle sztuk największej wartości, ile mieści się w kwocie, potem tyle sztuk następnej największej, ile mieści się w tym, co zostało, i tak aż do 1. Dla 289 mieszczą się dwie sztuki po 100 i zostaje 89, w 89 mieści się jedna sztuka po 50 i zostaje 39, i tak dalej, aż nic nie zostanie. W edytorze jest lista `VALUES`, od największej wartości do najmniejszej.

Napisz dwie funkcje:

- `make_change(amount)` zwraca słownik z wartościami, które wydaje kasa, i liczbą sztuk każdej, od największej wartości. Wartość, która nie jest potrzebna, jest pomijana, więc `make_change(0)` zwraca `{}`. Ujemna kwota zgłasza `ValueError`.
- `piece_count(amount)` zwraca, ile sztuk w sumie wydaje `make_change`.

| Wywołanie          | Zwraca                                      |
| ------------------ | ------------------------------------------- |
| `make_change(289)` | `{100: 2, 50: 1, 20: 1, 10: 1, 5: 1, 2: 2}` |
| `make_change(7)`   | `{5: 1, 2: 1}`                              |
| `make_change(0)`   | `{}`                                        |
| `make_change(-3)`  | zgłasza `ValueError`                        |
| `piece_count(289)` | `8`                                         |

Program pod funkcjami wczytuje kwotę i wypisuje wiersz w rodzaju `100 x 2` dla każdej wartości, którą wydaje kasa, od największej, a potem, ile to w sumie sztuk. Ze `289` w polu **Wejście** wypisuje:

```text
289
100 x 2
50 x 1
20 x 1
10 x 1
5 x 1
2 x 2
Pieces: 8
```
