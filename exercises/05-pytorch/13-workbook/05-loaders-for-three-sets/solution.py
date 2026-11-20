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
    mean = X[:n_train].mean(dim=0, keepdim=True)
    std = X[:n_train].std(dim=0, keepdim=True, correction=0)
    X = (X - mean) / std
    train = TensorDataset(X[:n_train], y[:n_train])
    valid = TensorDataset(X[n_train:n_train + n_valid], y[n_train:n_train + n_valid])
    test = TensorDataset(X[n_train + n_valid:], y[n_train + n_valid:])
    return (
        DataLoader(train, batch_size=batch_size, shuffle=True),
        DataLoader(valid, batch_size=batch_size),
        DataLoader(test, batch_size=batch_size),
    )


if __name__ == "__main__":
    train_loader, valid_loader, test_loader = make_loaders(X, y, 80, 20, 16)
    print(len(train_loader), len(valid_loader), len(test_loader))
    print(next(iter(valid_loader))[0].shape)
