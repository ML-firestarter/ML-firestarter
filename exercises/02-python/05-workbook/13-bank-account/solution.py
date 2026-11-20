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

    def check_open(self):
        if self.frozen:
            raise AccountFrozen(f"{self.owner}'s account is frozen")

    def deposit(self, amount):
        self.check_open()
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount
        self.history.append(f"deposit {amount}")
        return self.balance

    def withdraw(self, amount):
        self.check_open()
        if amount <= 0:
            raise ValueError("amount must be positive")
        if amount > self.balance:
            raise InsufficientFunds(f"{self.owner} has {self.balance}, needs {amount}")
        self.balance -= amount
        self.history.append(f"withdraw {amount}")
        return self.balance

    def __repr__(self):
        return f"Account({self.owner!r}, {self.balance})"


def transfer(source, target, amount):
    source.withdraw(amount)
    try:
        target.deposit(amount)
    except Exception:
        source.balance += amount
        source.history.pop()
        raise


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
