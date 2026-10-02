CHECKS = [
    ("[type(layer).__name__ for layer in make_mlp([2, 50, 40, 1])]", ["Linear", "ReLU", "Linear", "ReLU", "Linear"]),
    ("[tuple(layer.weight.shape) for layer in make_mlp([2, 50, 40, 1]) if isinstance(layer, torch.nn.Linear)]", [(50, 2), (40, 50), (1, 40)]),
    ("[type(layer).__name__ for layer in make_mlp([3, 1])]", ["Linear"]),
    ("[type(layer).__name__ for layer in make_mlp([3, 4, 1])]", ["Linear", "ReLU", "Linear"]),
    ("tuple(make_mlp([2, 50, 40, 1])(torch.ones(7, 2)).shape)", (7, 1)),
    ("tuple(make_mlp([5, 8, 8, 8, 2])(torch.ones(3, 5)).shape)", (3, 2)),
    ("type(make_mlp([2, 3, 1])).__name__", "Sequential"),
]
