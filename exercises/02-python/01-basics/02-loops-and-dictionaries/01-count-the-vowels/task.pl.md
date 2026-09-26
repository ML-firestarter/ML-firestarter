---
description: Policz każdą samogłoskę w zdaniu, litera po literze, w słowniku.
input: Monty Python
---

# Policz samogłoski

Dokończ `count_vowels(text)`. Funkcja zwraca słownik, który mówi, ile razy każda samogłoska występuje w `text`, wielka czy mała. Samogłoski to tutaj a, e, i, o, u i y, bez ą, ę i ó, a w słowniku jest każda z nich, z 0 dla tych, których w tekście nie ma.

| Wywołanie                      | Zwraca                                             |
| ------------------------------ | -------------------------------------------------- |
| `count_vowels("Abracadabra")`  | `{'a': 5, 'e': 0, 'i': 0, 'o': 0, 'u': 0, 'y': 0}` |
| `count_vowels("Monty Python")` | `{'a': 0, 'e': 0, 'i': 0, 'o': 2, 'u': 0, 'y': 2}` |

Potem dokończ program pod funkcją. Wczytuje wiersz z pola **Wejście** i ma wypisać każdą samogłoskę, która w nim występuje, z liczbą jej wystąpień, po jednej samogłosce w wierszu. Pomija samogłoski, których nie ma, i trzyma się kolejności a, e, i, o, u, y, bez względu na to, w jakiej kolejności pojawiają się w tekście. Dla `Monty Python` wypisze:

```text
Monty Python
o: 2
y: 2
```

Pierwszy wiersz to to, co wczytało `input()`.
