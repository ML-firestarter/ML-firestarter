CHECKS = [
    ("fit(X, y, 0.01, 0)", ([0.0, 0.0], 0.0)),
    ("(lambda r: [round(v, 3) for v in (*r[0], r[1])])(fit(X, y, 0.01, 1))", [2.8, 2.04, 0.5]),
    ("(lambda r: [round(v, 3) for v in (*r[0], r[1])])(fit(X, y, 0.01, 2))", [3.054, 2.104, 0.547]),
    ("(lambda r: [round(v, 2) for v in (*r[0], r[1])])(fit(X, y, 0.01, 5000))", [3.0, 0.5, 8.0]),
    ("(lambda r: [round(v, 3) for v in (*r[0], r[1])])(fit(torch.tensor([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [2.0, 1.0]]), torch.tensor([[3.0], [4.0], [6.0], [8.0]]), 0.1, 1))", [1.25, 0.9, 1.05]),
    ("(lambda r: [round(v, 2) for v in (*r[0], r[1])])(fit(torch.tensor([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [2.0, 1.0]]), torch.tensor([[3.0], [4.0], [6.0], [8.0]]), 0.1, 1500))", [2.0, 3.0, 1.0]),
    ("len(fit(torch.ones(3, 5), torch.ones(3, 1), 0.1, 1)[0])", 5),
]
