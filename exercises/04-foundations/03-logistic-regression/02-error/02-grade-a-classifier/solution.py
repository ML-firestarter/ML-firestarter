import math


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def accuracy(waits, cancelled, w, b):
    right = 0
    for i in range(len(waits)):
        p = sigmoid(w * waits[i] + b)
        if p >= 0.5:
            decision = 1
        else:
            decision = 0
        if decision == cancelled[i]:
            right += 1
    return right / len(waits)


def loss(waits, cancelled, w, b):
    total = 0
    for i in range(len(waits)):
        p = sigmoid(w * waits[i] + b)
        if cancelled[i] == 1:
            total += -math.log(p)
        else:
            total += -math.log(1 - p)
    return total / len(waits)


def baseline(cancelled):
    p = sum(cancelled) / len(cancelled)
    total = 0
    for y in cancelled:
        if y == 1:
            total += -math.log(p)
        else:
            total += -math.log(1 - p)
    return total / len(cancelled)


if __name__ == "__main__":
    waits = [2, 4, 6, 10, 12, 14]
    cancelled = [0, 0, 1, 0, 1, 1]
    print(accuracy(waits, cancelled, 0.5, -4))
    print(loss(waits, cancelled, 0.5, -4))
    print(baseline(cancelled))
