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


def train_one_epoch(model, loader, criterion, optimizer):
    total_loss = 0.0
    for X_batch, y_batch in loader:
        loss = criterion(model(X_batch), y_batch)
        total_loss += loss.item()
    return total_loss / len(loader)


if __name__ == "__main__":
    model = make_model([0.0, 0.0], 0.0)
    loader = DataLoader(TensorDataset(X, y), batch_size=2)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
    print(train_one_epoch(model, loader, nn.MSELoss(), optimizer))
