import torch
import torch.nn as nn


class WideAndDeep(nn.Module):
    def __init__(self, n_wide, n_deep, hidden=8):
        super().__init__()
        self.deep_stack = nn.Sequential(
            nn.Linear(n_deep, hidden),
            nn.ReLU(),
        )
        self.output_layer = nn.Linear(n_wide + hidden, 1)

    def forward(self, X_wide, X_deep):
        deep_output = self.deep_stack(X_deep)
        return self.output_layer(torch.cat([X_wide, deep_output], dim=1))


if __name__ == "__main__":
    model = WideAndDeep(2, 3)
    print(model)
    print(model(torch.ones(4, 2), torch.ones(4, 3)).shape)
