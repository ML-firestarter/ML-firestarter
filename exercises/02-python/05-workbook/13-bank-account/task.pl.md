---
description: Napisz konto bankowe, które odmawia tego, czego nie powinno robić, i przelew, który zostawia oba konta bez zmian, gdy nie uda się w połowie.
---

# Konto bankowe

*Korzysta z lekcji [Klasy](../../../../notes/02-python/04-programs/01-classes.pl.md), z której przyda się klasa, oraz z lekcji [Wyjątki](../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przyda się zgłaszanie i łapanie błędów.*

Pieniądze są przechowywane w całych groszach, więc nie ma ułamków, które mogłyby dać błędy zaokrągleń. W kodzie są już dwa nasze własne rodzaje błędów, `InsufficientFunds` i `AccountFrozen`, oraz początek klasy `Account(owner, balance=0)` z atrybutami `owner` i `balance`, flagą `frozen`, która na początku ma wartość `False`, i `history`, czyli listą tekstów, która na początku jest pusta. Dokończ tę klasę:

- `deposit(amount)` dodaje `amount` do salda, zapisuje w historii `deposit 50` (z kwotą) i zwraca nowe saldo.
- `withdraw(amount)` robi to samo w drugą stronę i zapisuje w historii `withdraw 30`. Gdy na koncie nie ma dość pieniędzy, zgłasza `InsufficientFunds("ann has 100, needs 101")`, z właścicielem, saldem i kwotą, i niczego nie zmienia.
- Obie metody zgłaszają `ValueError("amount must be positive")` dla kwoty równej 0 lub mniejszej oraz `AccountFrozen("ann's account is frozen")`, gdy konto jest zamrożone. Zamrożenie sprawdza się najpierw.
- `repr()` konta daje `Account('ann', 100)`.

`transfer(source, target, amount)` przenosi pieniądze z jednego konta na drugie: najpierw wypłaca je z `source`, a potem wpłaca na `target`. Cokolwiek pójdzie nie tak, oba konta muszą zostać **takie, jakie były**, łącznie z historią. Gdy nie uda się wypłata, nic jeszcze się nie zmieniło. Gdy jednak nie uda się wpłata, na przykład dlatego, że `target` jest zamrożone, pieniądze zdążyły już wyjść z `source` i muszą na nie wrócić, nie zostawiając śladu w jego historii. Błąd jest potem zgłaszany ponownie, żeby zobaczył go kod, który wywołał przelew.

| Wywołanie                                               | Wynik                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------ |
| `transfer(ann, bob, 30)` przy saldach 100 i 20 groszy   | ann ma 70, bob 50, a każde konto ma jeden wpis w historii    |
| `transfer(ann, bob, 500)`                               | zgłasza `InsufficientFunds` i nic się nie zmienia            |
| `transfer(ann, bob, 30)`, gdy konto boba jest zamrożone | zgłasza `AccountFrozen`, a ann nadal ma 100 i pustą historię |

Program pod kodem wykonuje przelew, potem przelew, który się nie udaje, i wypisuje oba konta.

> [!TIP]
> Żeby cofnąć zmiany, gdy wpłata się nie uda, złap błąd, przywróć saldo i usuń ostatni wpis z historii przez `pop()`, a potem samym `raise` przekaż ten sam błąd dalej.
