import torch
import torch.nn as nn


def rows_and_columns():
    """Embeds a 2×2 picture as two numbers: how much darker its top row is than its bottom row, and its left column than its right column."""
    embed = nn.Sequential(nn.Flatten(), nn.Linear(4, 2))
    with torch.no_grad():
        embed[1].weight.copy_(torch.tensor([[1.0, 1.0, -1.0, -1.0], [1.0, -1.0, 1.0, -1.0]]))
        embed[1].bias.zero_()
    return embed


def small_embedder():
    """Embeds a 2×2 picture as 8 numbers, with a layer and a ReLU that have the weights that seed 0 gives them."""
    torch.manual_seed(0)
    return nn.Sequential(nn.Flatten(), nn.Linear(4, 8), nn.ReLU())


def project(X_adv, X, epsilon):
    return (X + (X_adv - X).clamp(-epsilon, epsilon)).clamp(0, 1)


def push_away(embed, X, noise, epsilon, alpha, steps):
    X_adv = project(X + epsilon * noise, X, epsilon)
    return X_adv


if __name__ == "__main__":
    embed = rows_and_columns()
    X = torch.tensor([[[[0.5, 0.5], [0.5, 0.5]]]])
    noise = torch.tensor([[[[1.0, 0.5], [0.0, -1.0]]]])
    print(embed(X))
    for steps in [0, 1, 2, 3]:
        X_adv = push_away(embed, X, noise, 0.1, 0.04, steps)
        print(steps, X_adv.flatten().tolist(), embed(X_adv).tolist())
