import math

NET = {"w1": -2, "b1": 6, "w2": 2, "b2": -22, "v1": 4, "v2": 4, "c": -3}


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def order_slopes(km, turned_down, net):
    h1 = sigmoid(net["w1"] * km + net["b1"])
    h2 = sigmoid(net["w2"] * km + net["b2"])
    p = sigmoid(net["v1"] * h1 + net["v2"] * h2 + net["c"])
    delta = p - turned_down
    delta1 = delta * net["v1"] * h1 * (1 - h1)
    delta2 = delta * net["v2"] * h2 * (1 - h2)
    return {
        "w1": delta1 * km,
        "b1": delta1,
        "w2": delta2 * km,
        "b2": delta2,
        "v1": delta * h1,
        "v2": delta * h2,
        "c": delta,
    }


if __name__ == "__main__":
    slopes = order_slopes(3, 1, NET)
    for name in slopes:
        print(name, round(slopes[name], 3))
