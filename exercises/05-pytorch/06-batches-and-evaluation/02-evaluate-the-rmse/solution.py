import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

X = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
y = torch.tensor([[15.0], [23.0], [29.0], [33.0]])


def make_model(weights, bias):
    model = nn.Linear(len(weights), 1)
    with torch.no_grad():
        model.weight.copy_(torch.tensor([weights]))
        model.bias.fill_(bias)
    return model


def evaluate_rmse(model, loader):
    model.eval()
    squared_errors = 0.0
    count = 0
    with torch.no_grad():
        for X_batch, y_batch in loader:
            squared_errors += ((model(X_batch) - y_batch) ** 2).sum().item()
            count += len(y_batch)
    return (squared_errors / count) ** 0.5


if __name__ == "__main__":
    model = make_model([3.0, 0.0], 8.0)
    loader = DataLoader(TensorDataset(X, y), batch_size=3)
    print(evaluate_rmse(model, loader))
