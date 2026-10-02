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


def evaluate(model, loader):
    model.eval()
    total, count = 0.0, 0
    with torch.no_grad():
        for X_batch, y_batch in loader:
            total += ((model(X_batch) - y_batch) ** 2).sum().item()
            count += len(y_batch)
    return (total / count) ** 0.5


def train_and_validate(model, train_loader, valid_loader, learning_rate, epochs):
    criterion = nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    history = []
    for epoch in range(epochs):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
        history.append(round(evaluate(model, valid_loader), 3))
    return history


if __name__ == "__main__":
    train_loader, valid_loader, test_loader = make_loaders(X, y, 80, 20, 16)
    torch.manual_seed(1)
    print(train_and_validate(nn.Linear(2, 1), train_loader, valid_loader, 0.05, 6))
