import torch


def slope(f, x):
    point = torch.tensor(float(x), requires_grad=True)
    f(point).backward()
    return point.grad.item()


if __name__ == "__main__":
    print(slope(lambda x: x ** 2, 5.0))
    print(slope(lambda x: 3 * x + 8, 100.0))
