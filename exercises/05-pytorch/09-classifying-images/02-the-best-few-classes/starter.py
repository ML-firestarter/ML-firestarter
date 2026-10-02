import torch
import torch.nn.functional as F


def best_classes(logits, k):
    return [], torch.zeros(len(logits), k)


if __name__ == "__main__":
    logits = torch.tensor([[2.0, 0.5, -1.0, 1.0], [0.1, 0.2, 0.9, 3.0]])
    classes, probabilities = best_classes(logits, 2)
    print(classes)
    print(probabilities)
