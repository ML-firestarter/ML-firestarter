# The values of the notes and coins, from the biggest.
VALUES = [100, 50, 20, 10, 5, 2, 1]


def make_change(amount):
    if amount < 0:
        raise ValueError("the amount can't be negative")
    change = {}
    for value in VALUES:
        count = amount // value
        if count > 0:
            change[value] = count
            amount = amount % value
    return change


def piece_count(amount):
    total = 0
    for value, count in make_change(amount).items():
        total += count
    return total


if __name__ == "__main__":
    amount = int(input())
    for value, count in make_change(amount).items():
        print(f"{value} x {count}")
    print(f"Pieces: {piece_count(amount)}")
