---
description: Napisz program do śledzenia wydatków jako klasę i pętlę poleceń, z kwotami w groszach, cofaniem, raportem i błędami, które nie zatrzymują programu.
---

# Wydatki

*Korzysta z lekcji [Klasy](../../../../notes/02-python/04-programs/01-classes.pl.md), z której przyda się klasa, z lekcji [Wyjątki](../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przydadzą się błędy, oraz z lekcji [Projekt: wypożyczalnia](../../../../notes/02-python/04-programs/04-a-library-desk.pl.md), z której przyda się podział programu na warstwy.*

To program, który pilnuje, ile wydajesz, zbudowany z tych samych warstw co wypożyczalnia. Pieniądze są przechowywane w całych groszach. `money(cents)` jest już gotowe: zamienia `1250` na `"12.50"`. W kodzie jest też początek klasy `Tracker`, która przechowuje swoje wpisy w `entries`, liście krotek `(cents, category, note)`, i funkcji `desk(tracker)`, która pyta o polecenie, wyświetlając znak zachęty `> `, a po `quit` wypisuje `Goodbye` i kończy pracę. Dokończ jedno i drugie.

**`Tracker`** ma poniższe metody i zgłasza `ValueError` z komunikatem z tabeli:

| Metoda                                | Co robi                                                                                             | Błąd                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `add(amount_text, category, note="")` | zamienia kwotę na grosze (przecinek działa jak kropka: `"3,2"` to 320), dodaje wpis i zwraca grosze | `bad amount: x` dla tekstu, który nie jest liczbą, `amount must be positive` dla 0 lub mniej |
| `undo()`                              | usuwa ostatni wpis i zwraca go jako `(cents, category, note)`                                       | `nothing to undo`, gdy nie ma wpisów                                                         |
| `totals()`                            | zwraca pary `[category, cents]`, od największej sumy, a przy równych sumach alfabetycznie           |                                                                                              |
| `total()`                             | zwraca sumę wszystkich wpisów w groszach                                                            |                                                                                              |

**`desk`** odpowiada na poniższe polecenia, wpisane w dowolnej mieszance wielkich i małych liter, i wypisuje każdą odpowiedź pod poleceniem:

| Polecenie                    | Co wypisuje                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `add AMOUNT CATEGORY [NOTE]` | `added 12.50 to food`. Kategoria jest zapisywana małymi literami, a notatka to pozostałe słowa                                              |
| `undo`                       | `removed 8.00 from food`                                                                                                                    |
| `report`                     | linijkę `food 20.50` dla każdej kategorii, w kolejności z `totals()`, a potem `total 23.70` albo `no expenses`, gdy nie ma żadnych wydatków |
| `export`                     | sumy jako obiekt JSON, w którym kategoriom odpowiadają grosze, z posortowanymi kluczami: `{"food": 1250}`                                   |
| `quit`                       | `Goodbye`, po czym program się kończy                                                                                                       |

Polecenie, którego nie ma w tabeli, wypisuje `Error: unknown command: fly`, a `add` z mniej niż trzema słowami wypisuje `Error: usage: add AMOUNT CATEGORY [NOTE]`. `ValueError` z klasy `Tracker` jest wypisywany jako `Error: ` i jego komunikat, na przykład `Error: bad amount: x`. Pusta linijka jest pomijana, a gdy skończy się wejście, program kończy pracę bez słowa. Żaden z tych błędów nie zatrzymuje programu.

```text
> add 12.50 Food lunch
added 12.50 to food
> add x food
Error: bad amount: x
> report
food 12.50
total 12.50
> quit
Goodbye
```

Testy wywołują metody klasy `Tracker` i wpisują polecenia do twojego programu, a potem porównują wszystko, co wypisze.

> [!TIP]
> Trzymaj właściwą pracę poza pętlą: dzięki funkcji `run_command(tracker, line)`, która zwraca tekst do wypisania albo zgłasza `ValueError`, `desk` tylko wczytuje linijkę, wywołuje ją w `try` i wypisuje wynik. `float("3.2")` odczytuje kwotę, a `round(float(text) * 100)` zamienia ją na grosze.
