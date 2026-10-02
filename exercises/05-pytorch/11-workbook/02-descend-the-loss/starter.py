import torch

km = torch.tensor([2.0, 4.0, 6.0, 8.0])
fares = torch.tensor([15.0, 23.0, 29.0, 33.0])


def loss_slopes(w, b):
    return [0.0, 0.0]


def descend(w, b, learning_rate, steps):
    return [w, b]


if __name__ == "__main__":
    print(loss_slopes(0.0, 0.0))
    print(descend(0.0, 0.0, 0.01, 1))
