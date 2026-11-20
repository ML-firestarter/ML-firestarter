import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

torch.manual_seed(7)
n = 120
km = torch.rand(n, 1) * 12 + 1
minutes = torch.rand(n, 1) * 10
X = torch.cat([km, minutes], dim=1)
y = 3 * km + 0.5 * minutes + 8 + torch.randn(n, 1)


def make_loaders(X, y, n_train, n_valid, batch_size):
    train = TensorDataset(X[:n_train], y[:n_train])
    return DataLoader(train, batch_size=batch_size), None, None


if __name__ == "__main__":
    train_loader, valid_loader, test_loader = make_loaders(X, y, 80, 20, 16)
    print(len(train_loader))
