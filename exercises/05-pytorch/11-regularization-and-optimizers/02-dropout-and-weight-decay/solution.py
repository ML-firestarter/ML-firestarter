import torch
import torch.nn as nn


def make_model(n_inputs, n_hidden, n_classes, dropout):
    return nn.Sequential(
        nn.Linear(n_inputs, n_hidden),
        nn.ReLU(),
        nn.Dropout(dropout),
        nn.Linear(n_hidden, n_hidden),
        nn.ReLU(),
        nn.Dropout(dropout),
        nn.Linear(n_hidden, n_classes),
    )


def make_optimizer(model, learning_rate, weight_decay):
    return torch.optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=weight_decay)


def predict(model, X):
    model.eval()
    with torch.no_grad():
        return model(X).argmax(dim=1)


if __name__ == "__main__":
    torch.manual_seed(1)
    model = make_model(4, 32, 3, 0.5)
    print(model)
    print(make_optimizer(model, 0.01, 0.1))
    X = torch.randn(8, 4)
    print(predict(model, X))
    print(predict(model, X))
