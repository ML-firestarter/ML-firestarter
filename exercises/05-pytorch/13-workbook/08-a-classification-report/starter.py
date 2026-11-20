import torch


def report(logits, labels):
    return {"accuracy": 0.0, "top2": 0.0, "confidence": 0.0}


if __name__ == "__main__":
    logits = torch.tensor([[2.0, 1.0, 0.0], [0.0, 3.0, 1.0], [1.0, 2.0, 0.5], [0.0, 1.0, 2.0]])
    labels = torch.tensor([0, 1, 0, 2])
    print(report(logits, labels))
