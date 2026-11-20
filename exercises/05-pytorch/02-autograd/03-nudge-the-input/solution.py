import torch


def input_slope(prices, start, ride, fare):
    ride = ride.clone().requires_grad_()
    loss = (ride @ prices + start - fare) ** 2
    return torch.autograd.grad(loss, ride)[0]


def nudge(prices, start, ride, fare, step):
    return ride + step * input_slope(prices, start, ride, fare).sign()


if __name__ == "__main__":
    prices = torch.tensor([3.0, 0.5], requires_grad=True)
    start = torch.tensor(8.0, requires_grad=True)
    ride = torch.tensor([4.0, 6.0])
    print(input_slope(prices, start, ride, 30.0))
    print(nudge(prices, start, ride, 30.0, 0.1))
    print(prices.grad, start.grad, ride.requires_grad)
