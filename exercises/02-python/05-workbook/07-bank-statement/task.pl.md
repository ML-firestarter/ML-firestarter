---
description: Odczytaj z pliku wpłaty i wypłaty z konta, śledź jego saldo i zapisz wyciąg.
---

# Wyciąg z konta

*Korzysta z lekcji [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), [Warunki i funkcje](../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md) oraz [Listy list](../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md), ze względu na listy list i `raise`.*

Plik `account.txt` zawiera operacje na koncie, po jednej w wierszu: słowo `deposit` (wpłata) albo `withdraw` (wypłata), spację i kwotę w pełnych jednostkach. Oto jego pierwsze trzy wiersze:

```text
deposit 500
withdraw 120
deposit 75
```

Konto zaczyna puste, a jego saldo nigdy nie może zejść poniżej zera.

Napisz trzy funkcje:

- `read_transactions(path)` czyta plik w `path` i zwraca jego operacje jako listę list, `[kind, amount]`, z kwotą jako liczbą: `[['deposit', 500], ['withdraw', 120], ...]`. Wiersz, który zaczyna się innym słowem, zgłasza `ValueError`.
- `balances(transactions)` bierze taką listę i zwraca saldo po każdej operacji, jako listę: `[500, 380, 455]` dla tych trzech. Wypłata większa niż saldo zgłasza `ValueError`.
- `write_statement(transactions, path)` zapisuje wyciąg do pliku w `path`: wiersz dla każdej operacji, z saldem po niej, jak `deposit 500 -> 500`, i ostatni wiersz z saldem końcowym, jak `Balance: 455`. Gdy nie ma żadnych operacji, saldo wynosi 0.

Program pod funkcjami czyta `account.txt`, zapisuje wyciąg do `statement.txt` i go wypisuje. Gdy twoje funkcje działają, wypisuje:

```text
deposit 500 -> 500
withdraw 120 -> 380
deposit 75 -> 455
withdraw 300 -> 155
deposit 40 -> 195
Balance: 195
```

Sprawdzenia korzystają jeszcze z dwóch plików. W `overdraft.txt` wypłata jest większa niż to, co jest na koncie, a w `strange.txt` wiersz zaczyna się słowem, które nie jest ani `deposit`, ani `withdraw`.
