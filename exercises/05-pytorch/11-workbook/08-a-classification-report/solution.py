import torch


def report(logits, labels):
    probabilities = logits.softmax(dim=1)
    predictions = logits.argmax(dim=1)
    top_two = logits.topk(2, dim=1).indices
    accuracy = (predictions == labels).float().mean().item()
    top2 = (top_two == labels.unsqueeze(1)).any(dim=1).float().mean().item()
    confidence = probabilities.max(dim=1).values.mean().item()
    return {"accuracy": round(accuracy, 4), "top2": round(top2, 4), "confidence": round(confidence, 4)}


if __name__ == "__main__":
    logits = torch.tensor([[2.0, 1.0, 0.0], [0.0, 3.0, 1.0], [1.0, 2.0, 0.5], [0.0, 1.0, 2.0]])
    labels = torch.tensor([0, 1, 0, 2])
    print(report(logits, labels))
