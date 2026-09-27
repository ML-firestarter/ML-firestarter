import math

KMS = [1, 3, 4, 6, 8, 10, 12, 14]
TURNED_DOWN = [1, 1, 0, 0, 0, 0, 1, 1]
NET = {"w1": -2, "b1": 6, "w2": 2, "b2": -22, "v1": 4, "v2": 4, "c": -3}


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


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


def step(xs, turned_down, net, learning_rate):
    gradient = slopes(xs, turned_down, net)
    new_net = {}
    for name in net:
        new_net[name] = net[name] - learning_rate * gradient[name]
    return new_net


if __name__ == "__main__":
    print(slopes(KMS, TURNED_DOWN, NET))
    print(step(KMS, TURNED_DOWN, NET, 0.5))
    print(NET)
