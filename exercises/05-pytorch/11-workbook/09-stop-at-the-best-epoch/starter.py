import torch
import torch.nn as nn


def fit_with_patience(model, run_epoch, validate, max_epochs, patience):
    best_epoch = 0
    best_loss = float("inf")
    for epoch in range(1, max_epochs + 1):
        run_epoch(model)
        loss = validate(model)
        if loss < best_loss:
            best_epoch = epoch
            best_loss = loss
    return [best_epoch, round(best_loss, 4)]


if __name__ == "__main__":
    model = nn.Linear(1, 1)
    model.weight.data.zero_()
    model.bias.data.zero_()
    print(fit_with_patience(model, lambda m: m.weight.data.add_(1.0), lambda m: abs(m.weight.item() - 3), 10, 2))
    print(model.weight.item())
