CHECKS = [
    ("accuracy(darkest_pixel(), X, y)", 0.875),
    ("accuracy(darkest_pixel(), X[:4], y[:4])", 1.0),
    ("accuracy(darkest_pixel(), X[4:], y[4:])", 0.75),
    ("accuracy(darkest_pixel(), X, torch.tensor([1, 0, 3, 2, 1, 0, 2, 0]))", 0.125),
    ("type(accuracy(darkest_pixel(), X, y)).__name__", "float"),
    ("accuracy_under_attack(darkest_pixel(), X, y, [0.0, 0.05, 0.1, 0.2, 0.3])", {0.0: 0.875, 0.05: 0.75, 0.1: 0.625, 0.2: 0.375, 0.3: 0.125}),
    ("accuracy_under_attack(darkest_pixel(), X, y, [0.3, 0.1, 0.0])", {0.3: 0.125, 0.1: 0.625, 0.0: 0.875}),
    ("accuracy_under_attack(darkest_pixel(), X, y, [0.4])", {0.4: 0.0}),
    ("accuracy_under_attack(darkest_pixel(), X[:4], y[:4], [0.0, 0.1, 0.2])", {0.0: 1.0, 0.1: 0.75, 0.2: 0.5}),
    ("accuracy_under_attack(darkest_pixel(), X, y, [])", {}),
    ("(lambda model, before: [accuracy_under_attack(model, X, y, [0.1, 0.2]), [round(v, 4) for v in X.flatten().tolist()] == before, X.requires_grad, [p.grad for p in model.parameters()]])(darkest_pixel(), [round(v, 4) for v in X.flatten().tolist()])", [{0.1: 0.625, 0.2: 0.375}, True, False, [None, None]]),
]
