import torch
import torch.nn as nn


def fit_with_patience(model, run_epoch, validate, max_epochs, patience):
    best_epoch = 0
    best_loss = float("inf")
    best_state = None
    since_best = 0
    for epoch in range(1, max_epochs + 1):
        run_epoch(model)
        loss = validate(model)
        if loss < best_loss:
            best_epoch = epoch
            best_loss = loss
            best_state = {name: value.clone() for name, value in model.state_dict().items()}
            since_best = 0
        else:
            since_best += 1
            if since_best == patience:
                break
    model.load_state_dict(best_state)
    return [best_epoch, round(best_loss, 4)]


if __name__ == "__main__":
    model = nn.Linear(1, 1)
    model.weight.data.zero_()
    model.bias.data.zero_()
    print(fit_with_patience(model, lambda m: m.weight.data.add_(1.0), lambda m: abs(m.weight.item() - 3), 10, 2))
    print(model.weight.item())
