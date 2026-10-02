class Basket:
    pass


class DiscountBasket(Basket):
    pass


if __name__ == "__main__":
    print(Basket().add("tea", 3).add("cake", 4, 2))
