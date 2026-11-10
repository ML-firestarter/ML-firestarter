import torch
import torch.nn as nn


class MLP(nn.Module):
    def __init__(self, sizes, skip=False):
        super().__init__()
        layers = []
        for n_in, n_out in zip(sizes[:-2], sizes[1:-1]):
            layers.append(nn.Linear(n_in, n_out))
            layers.append(nn.ReLU())
        self.deep = nn.Sequential(*layers)
        self.skip = skip
        n_last = sizes[-2] + (sizes[0] if skip else 0)
        self.output = nn.Linear(n_last, sizes[-1])

    def forward(self, X):
        out = self.deep(X)
        if self.skip:
            out = torch.cat([X, out], dim=1)
        return self.output(out)


if __name__ == "__main__":
    model = MLP([2, 50, 40, 1], skip=True)
    print(sum(p.numel() for p in model.parameters()))
    print(model(torch.ones(3, 2)).shape)
