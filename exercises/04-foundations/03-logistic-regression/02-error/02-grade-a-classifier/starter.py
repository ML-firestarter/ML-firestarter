import math


def accuracy(waits, cancelled, w, b):
    return 0


def loss(waits, cancelled, w, b):
    return 0


def baseline(cancelled):
    return 0


if __name__ == "__main__":
    waits = [2, 4, 6, 10, 12, 14]
    cancelled = [0, 0, 1, 0, 1, 1]
    print(accuracy(waits, cancelled, 0.5, -4))
    print(loss(waits, cancelled, 0.5, -4))
    print(baseline(cancelled))
