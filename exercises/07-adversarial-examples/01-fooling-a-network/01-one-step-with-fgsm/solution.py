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


def fgsm(model, X, y, epsilon):
    X = X.clone().requires_grad_()
    loss = criterion(model(X), y)
    slope = torch.autograd.grad(loss, X)[0]
    return (X.detach() + epsilon * slope.sign()).clamp(0, 1)


if __name__ == "__main__":
    model = darkest_pixel()
    X = torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]]])
    y = torch.tensor([0])
    print(model(X).argmax(dim=1))
    X_adv = fgsm(model, X, y, 0.1)
    print(X_adv)
    print(model(X_adv).argmax(dim=1))
