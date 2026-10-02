import torch

X = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
y = torch.tensor([[15.0], [23.0], [29.0], [33.0]])


def fit(X, y, learning_rate, n_epochs):
    w = torch.zeros(X.shape[1], 1, requires_grad=True)
    b = torch.tensor(0.0, requires_grad=True)
    for _ in range(n_epochs):
        loss = ((X @ w + b - y) ** 2).mean()
        loss.backward()
        with torch.no_grad():
            w -= learning_rate * w.grad
            b -= learning_rate * b.grad
            w.grad.zero_()
            b.grad.zero_()
    return w.flatten().tolist(), b.item()


if __name__ == "__main__":
    print(fit(X, y, 0.01, 1))
    print(fit(X, y, 0.01, 5000))
