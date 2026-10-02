---
description: Przeczytaj linie paragonu ze sklepu, zsumuj dobre i zgłoś złe, nie zatrzymując się na pierwszym błędzie.
---

# Przeczytaj paragon

*Korzysta z lekcji [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla `raise`, `try`, `except` i `else` oraz [Odczyt i zapis plików](../../../../../notes/02-python/01-basics/04-files.pl.md) dla `split()`.*

Kasa sklepu drukuje na paragonie jedną pozycję w każdej linii: nazwę i cenę, jak `tea 3.50`. Ceny wpisuje się ręcznie, więc niektóre linie są błędne: litera tam, gdzie ma być liczba, brakująca cena, pusta linia. Dokończ dwie funkcje.

`parse_item(line)` zwraca pozycję z linii jako listę z jej nazwą i ceną w groszach, jako liczbą całkowitą: `parse_item("tea 3.50")` daje `["tea", 350]`. Cena może mieć przecinek zamiast kropki, jak `2,40`. Gdy linia jest błędna, zgłasza `ValueError` z komunikatem, który mówi, co jest nie tak:

| Linia                       | Komunikat                         |
| --------------------------- | --------------------------------- |
| pusta albo same spacje      | `empty line`                      |
| nie dokładnie nazwa i cena  | `expected a name and a price`     |
| cena, która nie jest liczbą | `bad price: ` i cena, jak `bad price: x` |
| cena poniżej 0              | `negative price`                  |

`read_receipt(lines)` przechodzi po liście linii i **nie zatrzymuje się** na błędnej. Zwraca słownik z:

- `"total"`: sumą cen dobrych linii, w groszach,
- `"items"`: liczbą dobrych linii,
- `"problems"`: listą z jednym `[line_number, message]` dla każdej błędnej linii, po kolei, licząc linie od 1.

| Wywołanie                                   | Zwraca                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `read_receipt(["tea 3.50", "jam 2,40"])`    | `{"total": 590, "items": 2, "problems": []}`                            |
| `read_receipt(["tea 3.50", "cake x"])`      | `{"total": 350, "items": 1, "problems": [[2, "bad price: x"]]}`         |

Program pod funkcjami czyta paragon z czterema błędnymi liniami i wypisuje wynik.

> [!TIP]
> `float("x")` zgłasza własny `ValueError`, z komunikatem o liczbach zmiennoprzecinkowych. Złap go w `parse_item` i zgłoś swój. W `read_receipt` `except ValueError as error` daje ci błąd, a `str(error)` jego komunikat.
