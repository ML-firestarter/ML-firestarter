GREY = "torch.tensor([[[[0.5, 0.5], [0.5, 0.5]]]])"
MOVED = "torch.tensor([[[[0.75, 0.42], [0.5, 0.2]]]])"
EDGES = "torch.tensor([[[[0.97, 0.02], [0.0, 1.0]]]])"
PAIR = "torch.tensor([[[[0.5, 0.5], [0.5, 0.5]]], [[[0.2, 0.8], [0.6, 0.1]]]])"
ROUNDED = "(lambda t: [[round(v, 4) for v in picture] for picture in t.flatten(1).tolist()])"
CHECKS = [
    (f"{ROUNDED}(project({MOVED}, {GREY}, 0.1))", [[0.6, 0.42, 0.5, 0.4]]),
    (f"{ROUNDED}(project({MOVED}, {GREY}, 0.3))", [[0.75, 0.42, 0.5, 0.2]]),
    (f"{ROUNDED}(project({MOVED}, {GREY}, 0.05))", [[0.55, 0.45, 0.5, 0.45]]),
    (f"{ROUNDED}(project({MOVED}, {GREY}, 0.0))", [[0.5, 0.5, 0.5, 0.5]]),
    (f"{ROUNDED}(project(torch.tensor([[[[1.3, -0.2], [0.04, 0.96]]]]), {EDGES}, 0.1))", [[1.0, 0.0, 0.04, 0.96]]),
    (f"{ROUNDED}(project(torch.tensor([[[[0.8, 0.2], [0.3, 0.7]]]]), {EDGES}, 0.1))", [[0.87, 0.12, 0.1, 0.9]]),
    (f"{ROUNDED}(project(torch.tensor([[[[0.75, 0.42], [0.5, 0.2]]], [[[0.75, 0.42], [0.5, 0.2]]]]), {PAIR}, 0.1))", [[0.6, 0.42, 0.5, 0.4], [0.3, 0.7, 0.5, 0.2]]),
    ("(lambda t: [list(t.shape), round(t.min().item(), 4), round(t.max().item(), 4)])(project(torch.full((2, 3, 4, 4), 0.9), torch.full((2, 3, 4, 4), 0.5), 0.25))", [[2, 3, 4, 4], 0.75, 0.75]),
    (f"(lambda X_adv, X: [project(X_adv, X, 0.1) is X_adv, [round(v, 4) for v in X_adv.flatten().tolist()], [round(v, 4) for v in X.flatten().tolist()]])({MOVED}, {GREY})", [False, [0.75, 0.42, 0.5, 0.2], [0.5, 0.5, 0.5, 0.5]]),
]
