CHECKS = [
    ("[round(v, 3) for v in train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 3)]", [671.0, 15.162, 10.894]),
    ("len(train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 5))", 5),
    ("train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 0)", []),
    ("round(train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 5000)[-1], 3)", 0.0),
    ("(lambda m: (train(m, X, y, 0.01, 5000), [round(v, 2) for v in (*m.weight.flatten().tolist(), *m.bias.tolist())])[1])(make_model([0.0, 0.0], 0.0))", [3.0, 0.5, 8.0]),
    ("(lambda m: (train(m, X, y, 0.01, 1), [round(v, 3) for v in (*m.weight.flatten().tolist(), *m.bias.tolist())])[1])(make_model([0.0, 0.0], 0.0))", [2.8, 2.04, 0.5]),
    ("(lambda m: all(p.grad is None or p.grad.abs().max().item() == 0 for p in m.parameters()) if train(m, X, y, 0.01, 2) else None)(make_model([0.0, 0.0], 0.0))", True),
    ("type(train(make_model([0.0, 0.0], 0.0), X, y, 0.01, 1)[0]).__name__", "float"),
]
