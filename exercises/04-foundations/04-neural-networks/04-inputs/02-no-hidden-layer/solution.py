import math

TURNED_DOWN = {2: 63, 4: 7, 6: 5, 8: 5, 10: 7, 12: 63, 14: 73}
KM_AVERAGE = 8
KM_SPREAD = 4
SQUARE_AVERAGE = 80
SQUARE_SPREAD = math.sqrt(4288)


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def inputs(km):
    x1 = (km - KM_AVERAGE) / KM_SPREAD
    x2 = (km * km - SQUARE_AVERAGE) / SQUARE_SPREAD
    return x1, x2


def predict(km, weights):
    w1, w2, b = weights
    x1, x2 = inputs(km)
    return sigmoid(w1 * x1 + w2 * x2 + b)


def loss(weights):
    total = 0
    for km, count in TURNED_DOWN.items():
        p = predict(km, weights)
        total += count * -math.log(p) + (100 - count) * -math.log(1 - p)
    return total / 700


def slopes(weights):
    slope_w1 = 0
    slope_w2 = 0
    slope_b = 0
    for km, count in TURNED_DOWN.items():
        x1, x2 = inputs(km)
        p = predict(km, weights)
        slope_w1 += (100 * p - count) * x1 / 700
        slope_w2 += (100 * p - count) * x2 / 700
        slope_b += (100 * p - count) / 700
    return slope_w1, slope_w2, slope_b


def train(learning_rate, steps):
    w1 = 0
    w2 = 0
    b = 0
    for step in range(steps):
        slope_w1, slope_w2, slope_b = slopes((w1, w2, b))
        w1 = w1 - learning_rate * slope_w1
        w2 = w2 - learning_rate * slope_w2
        b = b - learning_rate * slope_b
    return w1, w2, b


if __name__ == "__main__":
    weights = train(1, 1000)
    print([round(weight, 2) for weight in weights])
    print(round(loss(weights), 3))
    for km in [3, 5, 13]:
        print(km, round(predict(km, weights), 3))
