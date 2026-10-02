import torch
import torch.nn as nn


def make_mlp(sizes):
    return nn.Sequential(nn.Linear(sizes[0], sizes[-1]))


if __name__ == "__main__":
    model = make_mlp([2, 50, 40, 1])
    print(model)
    print(model(torch.randn(3, 2)).shape)
