GREY = "torch.tensor([[[[0.5, 0.5], [0.5, 0.5]]]])"
NOISE = "torch.tensor([[[[1.0, 0.5], [0.0, -1.0]]]])"
OTHER = "torch.tensor([[[[-1.0, 0.5], [0.0, 0.2]]]])"
THREE = "torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]], [[[0.3, 0.85], [0.2, 0.4]]], [[[0.5, 0.2], [0.75, 0.1]]]])"
NOISES = "torch.tensor([[[[1.0, 0.5], [0.0, -1.0]]], [[[-0.5, 1.0], [0.25, -0.75]]], [[[0.5, -1.0], [-0.25, 0.75]]]])"
ROUNDED = "(lambda t: [[round(v, 4) for v in picture] for picture in t.flatten(1).tolist()])"
CHECKS = [
    (f"{ROUNDED}(push_away(rows_and_columns(), {GREY}, {NOISE}, 0.1, 0.04, 0))", [[0.6, 0.55, 0.5, 0.4]]),
    (f"{ROUNDED}(push_away(rows_and_columns(), {GREY}, {NOISE}, 0.1, 0.04, 1))", [[0.6, 0.59, 0.46, 0.4]]),
    (f"{ROUNDED}(push_away(rows_and_columns(), {GREY}, {NOISE}, 0.1, 0.04, 2))", [[0.6, 0.6, 0.42, 0.4]]),
    (f"{ROUNDED}(push_away(rows_and_columns(), {GREY}, {NOISE}, 0.1, 0.04, 3))", [[0.6, 0.6, 0.4, 0.4]]),
    (f"{ROUNDED}(push_away(rows_and_columns(), {GREY}, {NOISE}, 0.1, 0.04, 10))", [[0.6, 0.6, 0.4, 0.4]]),
    (f"{ROUNDED}(push_away(rows_and_columns(), {GREY}, {OTHER}, 0.1, 0.04, 10))", [[0.4, 0.6, 0.4, 0.6]]),
    (f"{ROUNDED}(push_away(rows_and_columns(), {GREY}, torch.zeros(1, 1, 2, 2), 0.1, 0.04, 10))", [[0.5, 0.5, 0.5, 0.5]]),
    (f"{ROUNDED}(push_away(rows_and_columns(), torch.tensor([[[[0.95, 0.02], [0.5, 0.3]]]]), torch.tensor([[[[1.0, -0.4], [0.3, -1.0]]]]), 0.1, 0.04, 6))", [[1.0, 0.0, 0.6, 0.2]]),
    (f"{ROUNDED}(push_away(small_embedder(), {THREE}, {NOISES}, 0.1, 0.04, 4))", [[0.84, 0.3, 0.5, 0.0], [0.4, 0.95, 0.3, 0.3], [0.6, 0.22, 0.65, 0.2]]),
    (f"{ROUNDED}(push_away(small_embedder(), {THREE}, {NOISES}, 0.3, 0.1, 5))", [[0.8, 0.5, 0.7, 0.0], [0.05, 0.55, 0.5, 0.1], [0.8, 0.5, 0.45, 0.4]]),
    (f"(lambda embed, X, noise: [round(v, 4) for v in (embed(push_away(embed, X, noise, 0.1, 0.04, 4)) - embed(X)).norm(dim=1).tolist()])(small_embedder(), {THREE}, {NOISES})", [0.1032, 0.1395, 0.1234]),
    (f"(lambda net, X, noise, seen: [list(push_away(lambda Z: (seen.append(round((Z.detach() - X).abs().max().item(), 4)), net(Z))[1], X, noise, 0.1, 0.04, 5).shape), max(seen, default=None)])(rows_and_columns(), {GREY}, {NOISE}, [])", [[1, 1, 2, 2], 0.1]),
    (f"(lambda embed, X, noise: [push_away(embed, X, noise, 0.1, 0.04, 3).requires_grad, X.requires_grad, [round(v, 4) for v in X.flatten().tolist()], [p.grad for p in embed.parameters()], [p.requires_grad for p in embed.parameters()]])(rows_and_columns(), {GREY}, {NOISE})", [False, False, [0.5, 0.5, 0.5, 0.5], [None, None], [True, True]]),
]
