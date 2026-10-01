---
description: Read an account's deposits and withdrawals from a file, follow its balance, and write a statement.
---

# Bank statement

*Draws on [Reading and writing files](../../../../notes/02-python/01-basics/04-files.md), [Conditions and functions](../../../../notes/02-python/01-basics/01-conditions-and-functions.md) and [Lists of lists](../../../../notes/02-python/01-basics/05-lists-of-lists.md), for lists of lists and `raise`.*

The file `account.txt` has the transactions of an account, one on each line: the word `deposit` or `withdraw`, a space, and an amount in whole units. Here are its first three lines:

```text
deposit 500
withdraw 120
deposit 75
```

The account starts empty, and its balance can never go below zero.

Write three functions:

- `read_transactions(path)` reads the file at `path` and returns its transactions as a list of lists, `[kind, amount]`, with the amount as a number: `[['deposit', 500], ['withdraw', 120], ...]`. A line that starts with any other word raises a `ValueError`.
- `balances(transactions)` takes a list like that and returns the balance after each transaction, as a list: `[500, 380, 455]` for the three above. A withdrawal of more than the balance raises a `ValueError`.
- `write_statement(transactions, path)` writes a statement to the file at `path`: a line for each transaction, with the balance after it, like `deposit 500 -> 500`, and a last line with the final balance, like `Balance: 455`. With no transactions at all, the balance is 0.

The program under the functions reads `account.txt`, writes the statement to `statement.txt` and prints it. Once your functions work, it prints:

```text
deposit 500 -> 500
withdraw 120 -> 380
deposit 75 -> 455
withdraw 300 -> 155
deposit 40 -> 195
Balance: 195
```

The checks use two more files. In `overdraft.txt`, a withdrawal is more than the account has, and in `strange.txt`, a line starts with a word that's neither `deposit` nor `withdraw`.
