import torch
import torch.nn as nn


def make_mlp(sizes):
    layers = []
    for i in range(len(sizes) - 1):
        layers.append(nn.Linear(sizes[i], sizes[i + 1]))
        if i < len(sizes) - 2:
            layers.append(nn.ReLU())
    return nn.Sequential(*layers)


if __name__ == "__main__":
    model = make_mlp([2, 50, 40, 1])
    print(model)
    print(model(torch.randn(3, 2)).shape)
