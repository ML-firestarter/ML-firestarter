---
description: Sprawdź, czy siatka liczb jest kwadratem łacińskim, i zbuduj taki kwadrat o dowolnym rozmiarze.
input: "3\n1 2 3\n2 3 1\n3 1 2"
---

# Kwadrat łaciński

*Korzysta z lekcji [Listy list](../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md), ze względu na listy w listach i `raise`, [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md), ze względu na `range()` i `%`, oraz [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), ze względu na `sorted()` i `split()`.*

W **kwadracie łacińskim** o rozmiarze `n` każdy wiersz i każda kolumna zawiera każdą z liczb od 1 do `n` dokładnie raz, jak ten kwadrat o rozmiarze 3:

```text
1 2 3
2 3 1
3 1 2
```

W edytorze siatka jest listą wierszy, a każdy wiersz listą liczb, więc ten kwadrat to `[[1, 2, 3], [2, 3, 1], [3, 1, 2]]`. Napisz trzy funkcje:

- `column(grid, index)` zwraca liczby z kolumny o numerze `index`, od górnego wiersza w dół, jako listę.
- `is_latin_square(grid)` zwraca `True` dla kwadratu łacińskiego, a `False` dla wszystkiego innego. Dotyczy to siatki, która jest wyższa niż szeroka albo na odwrót, siatki z wierszami o różnej długości i siatki z liczbami innymi niż od 1 do `n`. Siatka ma zawsze co najmniej jeden wiersz.
- `shifted_square(n)` zwraca kwadrat łaciński o rozmiarze `n`, który zaczyna się wierszem `1, 2, ..., n`, a każdy następny wiersz jest przesunięty o jedno miejsce w lewo, z pierwszą liczbą, która przechodzi na koniec. Dla `n` mniejszego niż 1 zgłasza `ValueError`.

| Wywołanie                           | Zwraca                                      |
| ----------------------------------- | ------------------------------------------- |
| `column([[1, 2], [3, 4]], 1)`       | `[2, 4]`                                    |
| `is_latin_square([[1, 2], [2, 1]])` | `True`                                      |
| `is_latin_square([[1, 2], [1, 2]])` | `False` (w kolumnach liczby się powtarzają) |
| `is_latin_square([[1, 3], [3, 1]])` | `False` (to nie są liczby 1 i 2)            |
| `shifted_square(3)`                 | `[[1, 2, 3], [2, 3, 1], [3, 1, 2]]`         |
| `shifted_square(0)`                 | zgłasza `ValueError`                        |

Program pod funkcjami czyta `n`, a potem `n` wierszy liczb, ze spacjami między liczbami, i mówi, czy tworzą one kwadrat łaciński. Zmień wejście, żeby wypróbować inne siatki. Powyższe wejście daje:

```text
Latin square
```

> [!TIP]
> `sorted(row)` układa liczby wiersza w porządku, a wiersz, który zawiera liczby od 1 do `n` po razie, jest wtedy równy `list(range(1, n + 1))`. Najpierw sprawdź wiersze i zwróć `False`, gdy tylko któryś jest zły: wiersz, który przechodzi, ma dokładnie `n` liczb, więc proszenie o kolumny nie wyjdzie poza koniec wiersza.
