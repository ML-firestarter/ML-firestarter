import math

NET = {"w1": -2, "b1": 6, "w2": 2, "b2": -22, "v1": 4, "v2": 4, "c": -3}


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def predict(km, net):
    h1 = sigmoid(net["w1"] * km + net["b1"])
    h2 = sigmoid(net["w2"] * km + net["b2"])
    return sigmoid(net["v1"] * h1 + net["v2"] * h2 + net["c"])


def penalty(km, turned_down, net):
    p = predict(km, net)
    if turned_down == 1:
        return -math.log(p)
    return -math.log(1 - p)


def nudged_slope(km, turned_down, net, name):
    up = dict(net)
    up[name] = net[name] + 0.001
    down = dict(net)
    down[name] = net[name] - 0.001
    return (penalty(km, turned_down, up) - penalty(km, turned_down, down)) / 0.002


if __name__ == "__main__":
    for name in NET:
        print(name, round(nudged_slope(3, 1, NET, name), 3))
    print(NET)
