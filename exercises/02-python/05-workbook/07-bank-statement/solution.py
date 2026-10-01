def read_transactions(path):
    transactions = []
    with open(path) as file:
        for line in file:
            kind, amount = line.split()
            if kind != "deposit" and kind != "withdraw":
                raise ValueError(f"unknown transaction: {kind}")
            transactions.append([kind, int(amount)])
    return transactions


def balances(transactions):
    balance = 0
    after = []
    for kind, amount in transactions:
        if kind == "deposit":
            balance += amount
        else:
            if amount > balance:
                raise ValueError("not enough money in the account")
            balance -= amount
        after.append(balance)
    return after


def write_statement(transactions, path):
    after = balances(transactions)
    with open(path, "w") as file:
        for i in range(len(transactions)):
            kind, amount = transactions[i]
            file.write(f"{kind} {amount} -> {after[i]}\n")
        final = 0
        if len(after) > 0:
            final = after[-1]
        file.write(f"Balance: {final}\n")


if __name__ == "__main__":
    transactions = read_transactions("account.txt")
    write_statement(transactions, "statement.txt")
    with open("statement.txt") as file:
        print(file.read())
