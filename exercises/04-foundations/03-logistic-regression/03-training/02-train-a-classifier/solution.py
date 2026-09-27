import math


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def train(waits, cancelled, learning_rate, steps):
    n = len(waits)
    w = 0
    b = 0
    for step in range(steps):
        slope_w = 0
        slope_b = 0
        for i in range(n):
            p = sigmoid(w * waits[i] + b)
            slope_w += (p - cancelled[i]) * waits[i] / n
            slope_b += (p - cancelled[i]) / n
        w = w - learning_rate * slope_w
        b = b - learning_rate * slope_b
    return [w, b]


if __name__ == "__main__":
    waits = [2, 4, 6, 10, 12, 14]
    cancelled = [0, 0, 1, 0, 1, 1]
    print(train(waits, cancelled, 0.1, 5000))
