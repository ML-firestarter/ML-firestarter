class Basket:
    def __init__(self):
        self.items = []

    def add(self, name, price, quantity=1):
        if quantity < 1:
            raise ValueError("quantity has to be at least 1")
        self.items.append((name, price, quantity))
        return self

    def count(self):
        number = 0
        for name, price, quantity in self.items:
            number += quantity
        return number

    def total(self):
        money = 0
        for name, price, quantity in self.items:
            money += price * quantity
        return money

    def __repr__(self):
        return f"Basket(items={self.count()}, total={self.total()})"


class DiscountBasket(Basket):
    def __init__(self, percent):
        super().__init__()
        self.percent = percent

    def total(self):
        return super().total() * (100 - self.percent) / 100


if __name__ == "__main__":
    print(Basket().add("tea", 3).add("cake", 4, 2))
    print(DiscountBasket(50).add("tea", 3).add("cake", 4, 2).total())
