CHECKS = [
    ("count_parameters(make_mlp([2, 50, 40, 1]))", 2231),
    ("count_parameters(make_mlp([3, 4, 1]))", 21),
    ("count_parameters(make_mlp([2, 1]))", 3),
    ("count_parameters(torch.nn.Linear(5, 3))", 18),
    ("layer_shapes(make_mlp([2, 50, 40, 1]))", [(50, 2), (40, 50), (1, 40)]),
    ("layer_shapes(make_mlp([3, 4, 1]))", [(4, 3), (1, 4)]),
    ("layer_shapes(torch.nn.Sequential(torch.nn.Linear(2, 2), torch.nn.ReLU(), torch.nn.Linear(2, 1)))", [(2, 2), (1, 2)]),
]
