LOGITS = "torch.tensor([[2.0, 0.5, -1.0], [0.1, 0.2, 0.9], [1.0, 3.0, 2.0], [5.0, 0.0, 0.0]])"
CHECKS = [
    (f"accuracy({LOGITS}, torch.tensor([0, 2, 2, 0]))", 0.75),
    (f"accuracy({LOGITS}, torch.tensor([0, 2, 1, 0]))", 1.0),
    (f"accuracy({LOGITS}, torch.tensor([1, 1, 0, 1]))", 0.0),
    (f"accuracy({LOGITS}, torch.tensor([0, 0, 0, 0]))", 0.5),
    ("accuracy(torch.tensor([[-3.0, -1.0], [-2.0, -4.0]]), torch.tensor([1, 0]))", 1.0),
    ("accuracy(torch.tensor([[1.0, 2.0, 3.0]]), torch.tensor([2]))", 1.0),
    (f"type(accuracy({LOGITS}, torch.tensor([0, 2, 2, 0]))).__name__", "float"),
]
