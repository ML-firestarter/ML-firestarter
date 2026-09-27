import math
import random

KMS = [1, 3, 4, 6, 8, 10, 12, 14]
TURNED_DOWN = [1, 1, 0, 0, 0, 0, 1, 1]
XS = [km - 7 for km in KMS]


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def predict(x, net):
    h1 = sigmoid(net["w1"] * x + net["b1"])
    h2 = sigmoid(net["w2"] * x + net["b2"])
    return sigmoid(net["v1"] * h1 + net["v2"] * h2 + net["c"])


def loss(xs, turned_down, net):
    total = 0
    for i in range(len(xs)):
        p = predict(xs[i], net)
        if turned_down[i] == 1:
            total += -math.log(p)
        else:
            total += -math.log(1 - p)
    return total / len(xs)


def order_slopes(x, turned_down, net):
    h1 = sigmoid(net["w1"] * x + net["b1"])
    h2 = sigmoid(net["w2"] * x + net["b2"])
    p = sigmoid(net["v1"] * h1 + net["v2"] * h2 + net["c"])
    delta = p - turned_down
    delta1 = delta * net["v1"] * h1 * (1 - h1)
    delta2 = delta * net["v2"] * h2 * (1 - h2)
    return {
        "w1": delta1 * x,
        "b1": delta1,
        "w2": delta2 * x,
        "b2": delta2,
        "v1": delta * h1,
        "v2": delta * h2,
        "c": delta,
    }


def slopes(xs, turned_down, net):
    total = {}
    for name in net:
        total[name] = 0
    for i in range(len(xs)):
        one = order_slopes(xs[i], turned_down[i], net)
        for name in net:
            total[name] += one[name] / len(xs)
    return total


def start(seed):
    net = {}
    for name in ["w1", "b1", "w2", "b2", "v1", "v2", "c"]:
        net[name] = 0
    return net


def train(xs, turned_down, learning_rate, steps, seed):
    net = start(seed)
    return net


if __name__ == "__main__":
    net = train(XS, TURNED_DOWN, 0.5, 5000, 7)
    print(round(loss(XS, TURNED_DOWN, net), 3))
    print([round(predict(x, net), 3) for x in XS])
