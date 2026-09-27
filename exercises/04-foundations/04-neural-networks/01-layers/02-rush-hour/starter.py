import math

NET = {"w1": -2, "b1": 6, "w2": 2, "b2": -22, "v1": 4, "v2": 4, "c": -3}


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def predict(hour, net):
    h1 = sigmoid(net["w1"] * hour + net["b1"])
    h2 = sigmoid(net["w2"] * hour + net["b2"])
    return sigmoid(net["v1"] * h1 + net["v2"] * h2 + net["c"])


if __name__ == "__main__":
    for hour in range(24):
        print(hour, round(predict(hour, NET), 3))
