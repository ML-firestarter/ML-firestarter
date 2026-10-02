LOADER = "torch.utils.data.DataLoader(torch.utils.data.TensorDataset(X, y), batch_size={bs})"
CHECKS = [
    (f"round(evaluate_rmse(make_model([3.0, 0.0], 8.0), {LOADER.format(bs=4)}), 4)", 2.2361),
    (f"round(evaluate_rmse(make_model([3.0, 0.0], 8.0), {LOADER.format(bs=3)}), 4)", 2.2361),
    (f"round(evaluate_rmse(make_model([3.0, 0.0], 8.0), {LOADER.format(bs=1)}), 4)", 2.2361),
    (f"round(evaluate_rmse(make_model([3.0, 0.5], 8.0), {LOADER.format(bs=3)}), 4)", 0.0),
    (f"round(evaluate_rmse(make_model([0.0, 0.0], 0.0), {LOADER.format(bs=3)}), 3)", 25.904),
    ("(lambda m: (evaluate_rmse(m, " + LOADER.format(bs=2) + "), m.weight.flatten().tolist(), [p.grad for p in m.parameters()])[1:])(make_model([3.0, 0.0], 8.0))", ([3.0, 0.0], [None, None])),
    (f"type(evaluate_rmse(make_model([3.0, 0.0], 8.0), {LOADER.format(bs=3)})).__name__", "float"),
]
