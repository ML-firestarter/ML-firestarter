CHECKS = [
    ("(lambda g: [(round(lr, 4), n) for lr, n in (draw_settings(g), draw_settings(g), draw_settings(g))])(torch.Generator().manual_seed(7))", [(0.0634, 60), (0.0975, 31), (0.0223, 35)]),
    ("(lambda g: [(round(lr, 4), n) for lr, n in (draw_settings(g), draw_settings(g))])(torch.Generator().manual_seed(1))", [(0.1369, 25), (0.0402, 79)]),
    ("(lambda s: (min(x[0] for x in s) >= 0.01, max(x[0] for x in s) <= 0.3163, min(x[1] for x in s) >= 20, max(x[1] for x in s) <= 100))([draw_settings(torch.Generator().manual_seed(i)) for i in range(200)])", (True, True, True, True)),
    ("type(draw_settings(torch.Generator().manual_seed(7))[1]).__name__", "int"),
    ("best_trial([(0.8, 0.1, 30), (0.9, 0.05, 60), (0.9, 0.2, 40)])", (0.9, 0.05, 60)),
    ("best_trial([(0.5, 0.1, 30)])", (0.5, 0.1, 30)),
    ("best_trial([(0.4, 0.1, 30), (0.2, 0.3, 20), (0.7, 0.02, 90)])", (0.7, 0.02, 90)),
]
