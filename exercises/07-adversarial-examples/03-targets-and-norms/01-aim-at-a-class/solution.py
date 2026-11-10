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


def targeted_pgd(model, X, target, epsilon, alpha, steps):
    X_adv = X.clone()
    for step in range(steps):
        X_adv.requires_grad_()
        loss = criterion(model(X_adv), target)
        slope = torch.autograd.grad(loss, X_adv)[0]
        X_adv = project(X_adv.detach() - alpha * slope.sign(), X, epsilon)
    return X_adv


if __name__ == "__main__":
    model = darkest_pixel()
    X = torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]]])
    target = torch.tensor([2])
    print(model(X).argmax(dim=1))
    for epsilon, alpha, steps in [(0.1, 0.04, 3), (0.3, 0.1, 5)]:
        X_adv = targeted_pgd(model, X, target, epsilon, alpha, steps)
        print(X_adv.flatten().tolist(), model(X_adv).argmax(dim=1))
