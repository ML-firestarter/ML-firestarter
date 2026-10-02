import io
import torch
import torch.nn as nn


def make_model(n_inputs, n_hidden, n_classes):
    return nn.Sequential(nn.Linear(n_inputs, n_hidden), nn.ReLU(), nn.Linear(n_hidden, n_classes))


def make_checkpoint(model, hyperparameters):
    return {"model_state_dict": model.state_dict(), "hyperparameters": hyperparameters}


def build_from_checkpoint(checkpoint):
    model = make_model(**checkpoint["hyperparameters"])
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    return model


if __name__ == "__main__":
    torch.manual_seed(42)
    settings = {"n_inputs": 2, "n_hidden": 3, "n_classes": 2}
    model = make_model(**settings)
    buffer = io.BytesIO()
    torch.save(make_checkpoint(model, settings), buffer)
    buffer.seek(0)
    loaded = build_from_checkpoint(torch.load(buffer, weights_only=True))
    print(torch.equal(model(torch.ones(1, 2)), loaded(torch.ones(1, 2))))
