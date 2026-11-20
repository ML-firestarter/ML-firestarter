import torch


def input_slope(prices, start, ride, fare):
    loss = (ride @ prices + start - fare) ** 2
    return torch.zeros_like(ride)


def nudge(prices, start, ride, fare, step):
    return ride.clone()


if __name__ == "__main__":
    prices = torch.tensor([3.0, 0.5], requires_grad=True)
    start = torch.tensor(8.0, requires_grad=True)
    ride = torch.tensor([4.0, 6.0])
    print(input_slope(prices, start, ride, 30.0))
    print(nudge(prices, start, ride, 30.0, 0.1))
    print(prices.grad, start.grad, ride.requires_grad)
