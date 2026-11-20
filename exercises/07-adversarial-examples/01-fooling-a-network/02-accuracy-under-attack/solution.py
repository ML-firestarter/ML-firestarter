import torch
import torch.nn as nn

criterion = nn.CrossEntropyLoss()


def darkest_pixel():
    """A network for 2×2 pictures that says which of the four pixels is the darkest."""
    model = nn.Sequential(nn.Flatten(), nn.Linear(4, 4))
    with torch.no_grad():
        model[1].weight.copy_(torch.tensor([[4.0, 0.0, 0.0, 0.0], [0.0, 4.0, 0.0, 0.0], [0.0, 0.0, 4.0, 0.0], [0.0, 0.0, 0.0, 4.0]]))
        model[1].bias.zero_()
    return model


def fgsm(model, X, y, epsilon):
    X = X.clone().requires_grad_()
    loss = criterion(model(X), y)
    slope = torch.autograd.grad(loss, X)[0]
    return (X.detach() + epsilon * slope.sign()).clamp(0, 1)


X = torch.tensor(
    [
        [[[0.9, 0.1], [0.2, 0.1]]],
        [[[0.3, 0.85], [0.2, 0.4]]],
        [[[0.5, 0.2], [0.75, 0.1]]],
        [[[0.1, 0.3], [0.2, 0.45]]],
        [[[0.6, 0.55], [0.1, 0.2]]],
        [[[0.2, 0.9], [0.6, 0.1]]],
        [[[0.4, 0.4], [0.1, 0.95]]],
        [[[0.7, 0.2], [0.55, 0.3]]],
    ]
)
y = torch.tensor([0, 1, 2, 3, 0, 1, 3, 2])


def accuracy(model, X, y):
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


def accuracy_under_attack(model, X, y, epsilons):
    return {epsilon: accuracy(model, fgsm(model, X, y, epsilon), y) for epsilon in epsilons}


if __name__ == "__main__":
    model = darkest_pixel()
    print(accuracy(model, X, y))
    print(accuracy_under_attack(model, X, y, [0.0, 0.05, 0.1, 0.2, 0.3]))
