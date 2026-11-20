CHECKS = [
    ("[len(loader) for loader in make_loaders(X, y, 80, 20, 16)]", [5, 2, 2]),
    ("[len(loader.dataset) for loader in make_loaders(X, y, 80, 20, 16)]", [80, 20, 20]),
    ("[len(loader) for loader in make_loaders(X, y, 60, 30, 10)]", [6, 3, 3]),
    ("[len(loader) for loader in make_loaders(X, y, 100, 10, 7)]", [15, 2, 2]),
    ("[abs(round(v, 3)) for v in make_loaders(X, y, 80, 20, 16)[0].dataset.tensors[0].mean(dim=0).tolist()]", [0.0, 0.0]),
    ("[round(v, 3) for v in make_loaders(X, y, 80, 20, 16)[0].dataset.tensors[0].std(dim=0, correction=0).tolist()]", [1.0, 1.0]),
    ("[round(v, 3) for row in make_loaders(X, y, 80, 20, 16)[1].dataset.tensors[0][:2].tolist() for v in row]", [1.581, 0.847, -1.665, 1.732]),
    ("make_loaders(X, y, 80, 20, 16)[2].dataset.tensors[1].tolist() == y[100:].tolist()", True),
    ("[type(loader.sampler).__name__ for loader in make_loaders(X, y, 80, 20, 16)]", ["RandomSampler", "SequentialSampler", "SequentialSampler"]),
    ("(lambda loader: (torch.manual_seed(0), [round(v, 3) for v in next(iter(loader))[1].flatten()[:3].tolist()])[1])(make_loaders(X, y, 80, 20, 16)[0])", [45.018, 20.674, 21.856]),
]
