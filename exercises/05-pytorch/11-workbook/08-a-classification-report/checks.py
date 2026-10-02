LOGITS = "torch.tensor([[2.0, 1.0, 0.0], [0.0, 3.0, 1.0], [1.0, 2.0, 0.5], [0.0, 1.0, 2.0]])"
CHECKS = [
    (f"report({LOGITS}, torch.tensor([0, 1, 0, 2]))", {"accuracy": 0.75, "top2": 1.0, "confidence": 0.7007}),
    (f"report({LOGITS}, torch.tensor([1, 1, 1, 0]))", {"accuracy": 0.5, "top2": 0.75, "confidence": 0.7007}),
    (f"report({LOGITS}, torch.tensor([2, 2, 2, 2]))", {"accuracy": 0.25, "top2": 0.5, "confidence": 0.7007}),
    (f"sorted(report({LOGITS}, torch.tensor([0, 1, 0, 2])).keys())", ["accuracy", "confidence", "top2"]),
    ("report(torch.tensor([[1.0, 0.0], [0.0, 1.0]]), torch.tensor([0, 1]))['accuracy']", 1.0),
    ("report(torch.tensor([[5.0, 0.0], [0.0, 5.0]]), torch.tensor([0, 1]))['confidence']", 0.9933),
]
