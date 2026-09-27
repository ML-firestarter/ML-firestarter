import math


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def probability(wait, w, b):
    z = w * wait + b
    return sigmoid(z)


if __name__ == "__main__":
    print(sigmoid(0))
    print(probability(6, 0.5, -4))
