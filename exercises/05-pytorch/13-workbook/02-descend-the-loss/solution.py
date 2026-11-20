import torch

km = torch.tensor([2.0, 4.0, 6.0, 8.0])
fares = torch.tensor([15.0, 23.0, 29.0, 33.0])


def loss_slopes(w, b):
    w = torch.tensor(w, requires_grad=True)
    b = torch.tensor(b, requires_grad=True)
    loss = ((w * km + b - fares) ** 2).mean()
    loss.backward()
    return [round(w.grad.item(), 4), round(b.grad.item(), 4)]


def descend(w, b, learning_rate, steps):
    w = torch.tensor(w, requires_grad=True)
    b = torch.tensor(b, requires_grad=True)
    for step in range(steps):
        loss = ((w * km + b - fares) ** 2).mean()
        loss.backward()
        with torch.no_grad():
            w -= learning_rate * w.grad
            b -= learning_rate * b.grad
        w.grad.zero_()
        b.grad.zero_()
    return [round(w.item(), 3), round(b.item(), 3)]


if __name__ == "__main__":
    print(loss_slopes(0.0, 0.0))
    print(descend(0.0, 0.0, 0.01, 1))
