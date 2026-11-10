import torch
import torch.nn as nn


class MLP(nn.Module):
    def __init__(self, sizes, skip=False):
        super().__init__()

    def forward(self, X):
        return X


if __name__ == "__main__":
    model = MLP([2, 50, 40, 1], skip=True)
    print(sum(p.numel() for p in model.parameters()))
    print(model(torch.ones(3, 2)).shape)
