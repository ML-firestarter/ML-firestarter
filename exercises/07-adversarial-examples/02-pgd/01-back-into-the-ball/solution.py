import torch


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


if __name__ == "__main__":
    X = torch.tensor([[[[0.5, 0.5], [0.5, 0.5]]]])
    X_adv = torch.tensor([[[[0.75, 0.42], [0.5, 0.2]]]])
    print(project(X_adv, X, 0.1))
    print(project(X_adv, X, 0.3))
