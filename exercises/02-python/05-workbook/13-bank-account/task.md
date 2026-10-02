---
description: Write a bank account that refuses what it shouldn't, and a transfer that leaves both accounts as they were when it fails halfway.
---

# Bank account

*Draws on [Classes](../../../../notes/02-python/04-programs/01-classes.md) for the class, and on [Exceptions](../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for raising and catching errors.*

Money is kept in whole cents, so there are no decimals to go wrong. The code gives you two errors of our own, `InsufficientFunds` and `AccountFrozen`, and the start of `Account(owner, balance=0)`, which has `owner`, `balance`, a `frozen` flag that starts `False`, and a `history`, a list of text that starts empty. Finish it:

- `deposit(amount)` adds `amount` to the balance, writes `deposit 50` (with the amount) in the history, and returns the new balance.
- `withdraw(amount)` does the same the other way round, with `withdraw 30` in the history. When there isn't enough money, it raises `InsufficientFunds("ann has 100, needs 101")`, with the owner, the balance and the amount, and changes nothing.
- Both raise a `ValueError("amount must be positive")` for an amount of 0 or less, and `AccountFrozen("ann's account is frozen")` when the account is frozen. The frozen check goes first.
- `repr()` of an account is `Account('ann', 100)`.

`transfer(source, target, amount)` moves money from one account to another: it withdraws from `source` and then deposits in `target`. Whatever goes wrong, the accounts must be left **as they were**, history included. When the withdrawal fails, nothing has happened yet, but when the deposit fails, for instance because `target` is frozen, the money has already left `source`, and has to go back, without leaving a trace in its history. The error is raised again, for the caller to see.

| Call                                                | Result                                                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| `transfer(ann, bob, 30)`, with 100 and 20 cents      | ann has 70, bob 50, and each has one line of history         |
| `transfer(ann, bob, 500)`                            | raises `InsufficientFunds`, and nothing changes              |
| `transfer(ann, bob, 30)`, with bob's account frozen  | raises `AccountFrozen`, and ann still has 100, with no history |

The program under the code does a transfer, a failed one, and prints both accounts.

> [!TIP]
> To put things back when the deposit fails, catch the error, restore the balance and drop the last line of the history with `pop()`, and then use a bare `raise` to pass the same error on.
