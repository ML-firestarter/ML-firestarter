def read_transactions(path):
    transactions = []
    return transactions


def balances(transactions):
    after = []
    return after


def write_statement(transactions, path):
    with open(path, "w") as file:
        pass


if __name__ == "__main__":
    transactions = read_transactions("account.txt")
    write_statement(transactions, "statement.txt")
    with open("statement.txt") as file:
        print(file.read())
