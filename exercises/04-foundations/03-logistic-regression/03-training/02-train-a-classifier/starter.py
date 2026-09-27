import math


def train(waits, cancelled, learning_rate, steps):
    w = 0
    b = 0
    return [w, b]


if __name__ == "__main__":
    waits = [2, 4, 6, 10, 12, 14]
    cancelled = [0, 0, 1, 0, 1, 1]
    print(train(waits, cancelled, 0.1, 5000))
