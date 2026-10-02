import torch

X = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
y = torch.tensor([[15.0], [23.0], [29.0], [33.0]])
w = torch.tensor([[3.0], [0.5]])


def predict(X, w, b):
    return torch.zeros(len(X), 1)


def mse(y_pred, y):
    return 0.0


if __name__ == "__main__":
    y_pred = predict(X, w, 8.0)
    print(y_pred.shape)
    print(mse(y_pred, y))
