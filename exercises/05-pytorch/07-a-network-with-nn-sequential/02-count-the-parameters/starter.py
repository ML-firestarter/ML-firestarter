import torch
import torch.nn as nn


def make_mlp(sizes):
    layers = []
    for i in range(len(sizes) - 1):
        layers.append(nn.Linear(sizes[i], sizes[i + 1]))
        if i < len(sizes) - 2:
            layers.append(nn.ReLU())
    return nn.Sequential(*layers)


def count_parameters(model):
    return 0


def layer_shapes(model):
    return []


if __name__ == "__main__":
    model = make_mlp([2, 50, 40, 1])
    print(count_parameters(model))
    print(layer_shapes(model))
