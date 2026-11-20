---
description: Przeczytaj linijki paragonu, zsumuj poprawne i zgłoś błędne, nie zatrzymując się na pierwszym błędzie.
---

# Przeczytaj paragon

*Korzysta z lekcji [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przydadzą się `raise`, `try`, `except` i `else`, oraz z lekcji [Odczyt i zapis plików](../../../../../notes/02-python/01-basics/04-files.pl.md), z której przyda się `split()`.*

Kasa w sklepie drukuje na paragonie jedną pozycję w każdej linijce: nazwę i cenę, na przykład `tea 3.50`. Ceny są wpisywane ręcznie, więc niektóre linijki są błędne: litera tam, gdzie powinna być liczba, brak ceny, pusta linijka. Dokończ dwie funkcje.

`parse_item(line)` zwraca pozycję z linijki jako listę z nazwą i ceną w groszach, zapisaną jako liczba całkowita: `parse_item("tea 3.50")` daje `["tea", 350]`. Cena może mieć przecinek zamiast kropki, na przykład `2,40`. Gdy linijka jest błędna, funkcja zgłasza `ValueError` z komunikatem, który mówi, co jest nie tak:

| Linijka                         | Komunikat                                |
| ------------------------------- | ---------------------------------------- |
| pusta albo z samych spacji      | `empty line`                             |
| inna niż dokładnie nazwa i cena | `expected a name and a price`            |
| cena, która nie jest liczbą     | `bad price: ` i cena, np. `bad price: x` |
| cena mniejsza od 0              | `negative price`                         |

`read_receipt(lines)` przechodzi przez listę linijek i **nie zatrzymuje się** na błędnej. Zwraca słownik, w którym:

- `"total"` to suma cen z poprawnych linijek, w groszach,
- `"items"` to liczba poprawnych linijek,
- `"problems"` to lista z jedną parą `[line_number, message]` dla każdej błędnej linijki, po kolei, przy czym linijki są liczone od 1.

| Wywołanie                                | Zwraca                                                          |
| ---------------------------------------- | --------------------------------------------------------------- |
| `read_receipt(["tea 3.50", "jam 2,40"])` | `{"total": 590, "items": 2, "problems": []}`                    |
| `read_receipt(["tea 3.50", "cake x"])`   | `{"total": 350, "items": 1, "problems": [[2, "bad price: x"]]}` |

Program pod funkcjami czyta paragon z czterema błędnymi linijkami i wypisuje wynik.

> [!TIP]
> `float("x")` zgłasza własny `ValueError` z komunikatem o liczbach zmiennoprzecinkowych. Złap go w `parse_item` i zgłoś swój. W `read_receipt` błąd złapiesz przez `except ValueError as error`, a jego komunikat da ci `str(error)`.
