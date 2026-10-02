---
description: Napisz konto bankowe, które odmawia tego, czego nie powinno, i przelew, który zostawia oba konta takie, jakie były, gdy zawiedzie w połowie.
---

# Konto bankowe

*Korzysta z lekcji [Klasy](../../../../notes/02-python/04-programs/01-classes.pl.md) dla klasy oraz [Wyjątki](../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla zgłaszania i łapania błędów.*

Pieniądze trzyma się w całych groszach, więc nie ma ułamków, które mogłyby się pomylić. Kod daje ci dwa błędy naszego własnego rodzaju, `InsufficientFunds` i `AccountFrozen`, oraz początek `Account(owner, balance=0)`, które ma `owner`, `balance`, flagę `frozen`, która zaczyna jako `False`, i `history`, listę tekstów, która zaczyna pusta. Dokończ je:

- `deposit(amount)` dodaje `amount` do salda, zapisuje `deposit 50` (z kwotą) w historii i zwraca nowe saldo.
- `withdraw(amount)` robi to samo w drugą stronę, z `withdraw 30` w historii. Gdy nie ma dość pieniędzy, zgłasza `InsufficientFunds("ann has 100, needs 101")`, z właścicielem, saldem i kwotą, i niczego nie zmienia.
- Oba zgłaszają `ValueError("amount must be positive")` dla kwoty 0 lub mniejszej oraz `AccountFrozen("ann's account is frozen")`, gdy konto jest zamrożone. Sprawdzenie zamrożenia idzie pierwsze.
- `repr()` konta to `Account('ann', 100)`.

`transfer(source, target, amount)` przenosi pieniądze z jednego konta na drugie: wypłaca z `source`, a potem wpłaca na `target`. Cokolwiek pójdzie źle, konta muszą zostać **takie, jakie były**, z historią włącznie. Gdy wypłata zawiedzie, nic jeszcze się nie stało, ale gdy zawiedzie wpłata, na przykład dlatego, że `target` jest zamrożone, pieniądze już opuściły `source` i muszą wrócić, bez śladu w jego historii. Błąd jest zgłaszany ponownie, żeby zobaczył go wywołujący.

| Wywołanie                                           | Wynik                                                        |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `transfer(ann, bob, 30)`, ze 100 i 20 groszami       | ann ma 70, bob 50, a każde ma jedną linię historii           |
| `transfer(ann, bob, 500)`                            | zgłasza `InsufficientFunds` i nic się nie zmienia            |
| `transfer(ann, bob, 30)`, z zamrożonym kontem boba   | zgłasza `AccountFrozen`, a ann nadal ma 100, bez historii    |

Program pod kodem robi przelew, nieudany przelew i wypisuje oba konta.

> [!TIP]
> Żeby cofnąć rzeczy, gdy wpłata zawiedzie, złap błąd, przywróć saldo i usuń ostatnią linię historii przez `pop()`, a potem użyj samego `raise`, żeby przekazać ten sam błąd dalej.
