---
description: Napisz program do wydatków jako klasę i pętlę poleceń, z kwotami w groszach, cofaniem, raportem i błędami, które nie zatrzymują programu.
---

# Wydatki

*Korzysta z lekcji [Klasy](../../../../notes/02-python/04-programs/01-classes.pl.md) dla klasy, [Wyjątki](../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla błędów oraz [Projekt: kontuar biblioteki](../../../../notes/02-python/04-programs/04-a-library-desk.pl.md) dla kształtu programu.*

Program do pilnowania tego, co wydajesz, zbudowany w warstwach kontuaru biblioteki. Pieniądze trzyma się w całych groszach. `money(cents)` jest napisane: zamienia `1250` na `"12.50"`. Kod ma też początek `Tracker`, który trzyma swoje `entries`, listę `(cents, category, note)`, i `desk(tracker)`, który pyta o polecenie ze znakiem zachęty `> ` i zatrzymuje się na `quit`, wypisując `Goodbye`. Dokończ oba.

**`Tracker`** ma te metody i zgłasza `ValueError` z komunikatem z tabeli:

| Metoda                          | Co robi                                                                                     | Błąd                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `add(amount_text, category, note="")` | zamienia kwotę na grosze (przecinek działa jak kropka: `"3,2"` to 320), dodaje wpis, zwraca grosze | `bad amount: x` dla tekstu, który nie jest liczbą, `amount must be positive` dla 0 lub mniej |
| `undo()`                        | usuwa ostatni wpis i zwraca go jako `(cents, category, note)`                               | `nothing to undo`, gdy nie ma wpisów               |
| `totals()`                      | zwraca pary `[category, cents]`, z największą sumą pierwszą, a przy równych alfabetycznie   |                                                    |
| `total()`                       | zwraca sumę wszystkich wpisów, w groszach                                                   |                                                    |

**`desk`** odpowiada na te polecenia, w dowolnej mieszance wielkich liter, i wypisuje każdą odpowiedź pod poleceniem:

| Polecenie                      | Co wypisuje                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `add AMOUNT CATEGORY [NOTE]`   | `added 12.50 to food`. Kategoria jest trzymana małymi literami, a notatka to reszta słów |
| `undo`                         | `removed 8.00 from food`                                                              |
| `report`                       | linię `food 20.50` dla każdej kategorii, tak jak daje je `totals()`, a potem `total 23.70`, albo `no expenses`, gdy nie ma żadnych |
| `export`                       | sumy jako obiekt JSON z kategorii i groszy, z posortowanymi kluczami: `{"food": 1250}` |
| `quit`                         | `Goodbye` i program się kończy                                                        |

Polecenie, które nie jest żadnym z tych, wypisuje `Error: unknown command: fly`, a `add` z mniej niż trzema słowami wypisuje `Error: usage: add AMOUNT CATEGORY [NOTE]`. `ValueError` z trackera wypisuje się jako `Error: ` i jego komunikat, jak `Error: bad amount: x`. Linia bez niczego jest ignorowana, a program kończy się po cichu, gdy skończy się wejście. Żaden z błędów nie zatrzymuje programu.

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

Testy wywołują metody trackera i wpisują polecenia do twojego programu, i porównują wszystko, co wypisuje.

> [!TIP]
> Trzymaj pracę poza pętlą: funkcja `run_command(tracker, line)`, która zwraca tekst do wypisania albo zgłasza `ValueError`, sprawia, że `desk` tylko czyta, ma `try` i wypisuje. `float("3.2")` czyta kwotę, a `round(float(text) * 100)` robi z niej grosze.
