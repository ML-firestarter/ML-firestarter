class InsufficientFunds(Exception):
    pass


class AccountFrozen(Exception):
    pass


class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
        self.frozen = False
        self.history = []

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        self.balance -= amount
        return self.balance

    def __repr__(self):
        return f"Account({self.owner!r}, {self.balance})"


def transfer(source, target, amount):
    source.withdraw(amount)
    target.deposit(amount)


if __name__ == "__main__":
    ann = Account("ann", 100)
    bob = Account("bob", 20)
    transfer(ann, bob, 30)
    print(ann, bob)
    bob.frozen = True
    try:
        transfer(ann, bob, 10)
    except AccountFrozen as error:
        print(error)
    print(ann, bob)
