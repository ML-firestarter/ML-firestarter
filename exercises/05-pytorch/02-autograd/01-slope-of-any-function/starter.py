import torch


def slope(f, x):
    return 0.0


if __name__ == "__main__":
    print(slope(lambda x: x ** 2, 5.0))
    print(slope(lambda x: 3 * x + 8, 100.0))
