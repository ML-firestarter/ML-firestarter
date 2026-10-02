CHECKS = [
    ("[t.device.type for t in to_device((torch.ones(2, 2), torch.zeros(3)), 'cpu')]", ["cpu", "cpu"]),
    ("type(to_device((torch.ones(2), torch.ones(2)), 'cpu')).__name__", "tuple"),
    ("type(to_device([torch.ones(2), torch.ones(2)], 'cpu')).__name__", "list"),
    ("[t.tolist() for t in to_device((torch.tensor([[1.0, 2.0]]), torch.tensor([7.0])), 'cpu')]", [[[1.0, 2.0]], [7.0]]),
    ("len(to_device((torch.ones(1), torch.ones(1), torch.ones(1)), 'cpu'))", 3),
    ("to_device((torch.ones(2),), torch.device('cpu'))[0].device.type", "cpu"),
    ("to_device((torch.ones(2),), 'cpu')[0].dtype == torch.float32", True),
]
