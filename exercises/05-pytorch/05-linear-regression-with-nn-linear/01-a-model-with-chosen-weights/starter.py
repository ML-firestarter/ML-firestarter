import torch
import torch.nn as nn


def make_model(weights, bias):
    model = nn.Linear(len(weights), 1)
    return model


if __name__ == "__main__":
    model = make_model([3.0, 0.5], 8.0)
    print(model.weight)
    print(model(torch.tensor([[4.0, 6.0]])))
