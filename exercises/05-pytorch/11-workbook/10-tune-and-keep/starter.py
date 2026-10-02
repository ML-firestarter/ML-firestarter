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


train_loader, valid_loader, test_loader = make_loaders(X, y, 80, 20, 16)


def train_model(learning_rate):
    torch.manual_seed(0)
    model = nn.Linear(2, 1)
    criterion = nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    for epoch in range(15):
        model.train()
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            criterion(model(X_batch), y_batch).backward()
            optimizer.step()
    return model, evaluate(model, valid_loader)


def search(learning_rates):
    best = None
    for learning_rate in learning_rates:
        model, valid_rmse = train_model(learning_rate)
        if best is None or valid_rmse < best["valid_rmse"]:
            best = {"learning_rate": learning_rate, "valid_rmse": valid_rmse}
    return best


def load_best(checkpoint):
    return nn.Linear(2, 1)


if __name__ == "__main__":
    best = search([0.0001, 0.01, 0.1, 0.2])
    print(best["learning_rate"], round(best["valid_rmse"], 2))
