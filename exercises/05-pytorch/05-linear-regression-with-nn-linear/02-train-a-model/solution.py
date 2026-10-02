import torch
import torch.nn as nn

X = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
y = torch.tensor([[15.0], [23.0], [29.0], [33.0]])


def make_model(weights, bias):
    model = nn.Linear(len(weights), 1)
    with torch.no_grad():
        model.weight.copy_(torch.tensor([weights]))
        model.bias.fill_(bias)
    return model


def train(model, X, y, learning_rate, n_epochs):
    criterion = nn.MSELoss()
    optimizer = torch.optim.SGD(model.parameters(), lr=learning_rate)
    losses = []
    for _ in range(n_epochs):
        loss = criterion(model(X), y)
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        losses.append(loss.item())
    return losses


if __name__ == "__main__":
    model = make_model([0.0, 0.0], 0.0)
    losses = train(model, X, y, 0.01, 5000)
    print(round(losses[0], 2), round(losses[-1], 2))
    print(model.weight, model.bias)
