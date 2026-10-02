import torch


def fares_with_fee(km, per_km, fee, minimum):
    return (km * per_km + fee).clamp(min=minimum)


def share_above(fares, limit):
    return (fares > limit).float().mean().item()


if __name__ == "__main__":
    km = torch.tensor([1.0, 5.0, 10.0])
    fares = fares_with_fee(km, 2.0, 3.0, 8.0)
    print(fares)
    print(share_above(fares, 10.0))
