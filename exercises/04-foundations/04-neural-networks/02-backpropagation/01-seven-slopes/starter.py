import math

NET = {"w1": -2, "b1": 6, "w2": 2, "b2": -22, "v1": 4, "v2": 4, "c": -3}


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def order_slopes(km, turned_down, net):
    return {"w1": 0, "b1": 0, "w2": 0, "b2": 0, "v1": 0, "v2": 0, "c": 0}


if __name__ == "__main__":
    slopes = order_slopes(3, 1, NET)
    for name in slopes:
        print(name, round(slopes[name], 3))
