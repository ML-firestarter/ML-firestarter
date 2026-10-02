import torch


def accuracy(logits, labels):
    return 0.0


if __name__ == "__main__":
    logits = torch.tensor([[2.0, 0.5, -1.0], [0.1, 0.2, 0.9], [1.0, 3.0, 2.0], [5.0, 0.0, 0.0]])
    labels = torch.tensor([0, 2, 2, 0])
    print(accuracy(logits, labels))
