import torch
import torch.nn as nn


class WideAndDeep(nn.Module):
    def __init__(self, n_wide, n_deep, hidden=8):
        super().__init__()

    def forward(self, X_wide, X_deep):
        return X_wide


if __name__ == "__main__":
    model = WideAndDeep(2, 3)
    print(model)
    print(model(torch.ones(4, 2), torch.ones(4, 3)).shape)
