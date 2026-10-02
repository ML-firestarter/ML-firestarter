import torch


def fit_in_standard_units(km, fares, learning_rate, steps):
    return [0.0, 0.0]


if __name__ == "__main__":
    km = torch.tensor([2.0, 4.0, 6.0, 8.0])
    fares = torch.tensor([15.0, 23.0, 29.0, 33.0])
    print(fit_in_standard_units(km, fares, 0.1, 300))
