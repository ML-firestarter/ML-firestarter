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


def small_network():
    """A network with a hidden layer, for 2×2 pictures and 3 classes, with the weights that seed 0 gives it."""
    torch.manual_seed(0)
    return nn.Sequential(nn.Flatten(), nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, 3))


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def pgd(model, X, y, epsilon, alpha, steps):
    X_adv = X.clone().requires_grad_()
    loss = criterion(model(X_adv), y)
    slope = torch.autograd.grad(loss, X_adv)[0]
    return project(X_adv.detach() + alpha * slope.sign(), X, epsilon)


if __name__ == "__main__":
    model = darkest_pixel()
    X = torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]]])
    y = torch.tensor([0])
    for steps in [1, 2, 3, 10]:
        print(steps, pgd(model, X, y, 0.1, 0.04, steps).flatten().tolist())
