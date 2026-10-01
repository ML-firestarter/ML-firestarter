import torch

KMS = torch.tensor([2.0, 4.0, 6.0, 8.0])
FARES = torch.tensor([15.0, 23.0, 29.0, 33.0])


def train(kms, fares, steps, learning_rate):
    w = torch.tensor(0.0, requires_grad=True)
    b = torch.tensor(0.0, requires_grad=True)
    for _ in range(steps):
        loss = ((w * kms + b - fares) ** 2).mean()
    return w.item(), b.item()


if __name__ == "__main__":
    print(train(KMS, FARES, 1, 0.02))
    print(train(KMS, FARES, 1500, 0.02))
