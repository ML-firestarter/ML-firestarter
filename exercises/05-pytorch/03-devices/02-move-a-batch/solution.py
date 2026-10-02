import torch


def to_device(batch, device):
    moved = [tensor.to(device) for tensor in batch]
    return tuple(moved) if isinstance(batch, tuple) else moved


if __name__ == "__main__":
    X = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
    y = torch.tensor([[5.0], [6.0]])
    X, y = to_device((X, y), "cpu")
    print(X.device, y.device)
