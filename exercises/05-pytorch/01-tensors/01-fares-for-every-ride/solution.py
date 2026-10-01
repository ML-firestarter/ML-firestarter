import torch

DAY = torch.tensor([[2.0, 2.0], [4.0, 6.0], [6.0, 6.0], [8.0, 2.0]])
PRICES = torch.tensor([3.0, 0.5])


def fares(rides, prices, start):
    return rides @ prices + start


def takings(rides, prices, start):
    return fares(rides, prices, start).sum().item()


if __name__ == "__main__":
    print(fares(DAY, PRICES, 8))
    print(takings(DAY, PRICES, 8))
