import math


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def slopes(waits, cancelled, w, b):
    n = len(waits)
    slope_w = 0
    slope_b = 0
    for i in range(n):
        p = sigmoid(w * waits[i] + b)
        slope_w += (p - cancelled[i]) * waits[i] / n
        slope_b += (p - cancelled[i]) / n
    return [slope_w, slope_b]


def step(waits, cancelled, w, b, learning_rate):
    gradient = slopes(waits, cancelled, w, b)
    new_w = w - learning_rate * gradient[0]
    new_b = b - learning_rate * gradient[1]
    return [new_w, new_b]


if __name__ == "__main__":
    waits = [2, 4, 6, 10, 12, 14]
    cancelled = [0, 0, 1, 0, 1, 1]
    print(slopes(waits, cancelled, 0, 0))
    print(step(waits, cancelled, 0, 0, 0.1))
