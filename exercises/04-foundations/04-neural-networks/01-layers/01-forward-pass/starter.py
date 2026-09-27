import math

NET = {"w1": -2, "b1": 6, "w2": 2, "b2": -22, "v1": 4, "v2": 4, "c": -3}


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def neuron(inputs, weights, bias):
    return 0


def predict(km, net):
    return 0


if __name__ == "__main__":
    print(neuron([3], [-2], 6))
    for km in [2, 4, 6, 8, 10, 12, 14]:
        print(km, round(predict(km, NET), 3))
