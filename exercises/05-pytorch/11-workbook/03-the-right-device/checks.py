CHECKS = [
    ("get_device()", "cpu"),
    ("type(to_device(torch.ones(2), 'cpu')).__name__", "Tensor"),
    ("type(to_device((torch.ones(1), torch.zeros(1)), 'cpu')).__name__", "tuple"),
    ("type(to_device([torch.ones(1), torch.zeros(1)], 'cpu')).__name__", "list"),
    ("sorted(to_device({'b': torch.ones(1), 'a': torch.zeros(1)}, 'cpu').keys())", ["a", "b"]),
    ("to_device({'X': [torch.ones(2), torch.zeros(1)], 'y': (torch.tensor(3.0),)}, 'cpu')['X'][0].tolist()", [1.0, 1.0]),
    ("to_device({'X': [torch.ones(2), torch.zeros(1)], 'y': (torch.tensor(3.0),)}, 'cpu')['y'][0].item()", 3.0),
    ("to_device([torch.tensor([1.0, 2.0]), {'a': torch.tensor(5.0)}], 'cpu')[1]['a'].item()", 5.0),
    ("to_device((torch.ones(1), {'a': torch.ones(1)}), 'cpu')[1]['a'].device.type", "cpu"),
]
