import math

# h1 rises around 15:30, and h2 around 19:30, so 6 * h1 - 6 * h2 is close to 6 between
# them, in the rush hour, and close to 0 before and after it.
NET = {"w1": 2, "b1": -31, "w2": 2, "b2": -39, "v1": 6, "v2": -6, "c": -3}


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def predict(hour, net):
    h1 = sigmoid(net["w1"] * hour + net["b1"])
    h2 = sigmoid(net["w2"] * hour + net["b2"])
    return sigmoid(net["v1"] * h1 + net["v2"] * h2 + net["c"])


if __name__ == "__main__":
    for hour in range(24):
        print(hour, round(predict(hour, NET), 3))
