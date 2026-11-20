ONE = "torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]]])"
THREE = "torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]], [[[0.3, 0.85], [0.2, 0.4]]], [[[0.5, 0.2], [0.75, 0.1]]]])"
ROUNDED = "(lambda t: [[round(v, 4) for v in picture] for picture in t.flatten(1).tolist()])"
CHECKS = [
    (f"{ROUNDED}(pgd(darkest_pixel(), {ONE}, torch.tensor([0]), 0.1, 0.04, 1))", [[0.86, 0.24, 0.44, 0.14]]),
    (f"{ROUNDED}(pgd(darkest_pixel(), {ONE}, torch.tensor([0]), 0.1, 0.04, 2))", [[0.82, 0.28, 0.48, 0.18]]),
    (f"{ROUNDED}(pgd(darkest_pixel(), {ONE}, torch.tensor([0]), 0.1, 0.04, 3))", [[0.8, 0.3, 0.5, 0.2]]),
    (f"{ROUNDED}(pgd(darkest_pixel(), {ONE}, torch.tensor([0]), 0.1, 0.04, 10))", [[0.8, 0.3, 0.5, 0.2]]),
    (f"{ROUNDED}(pgd(darkest_pixel(), {ONE}, torch.tensor([0]), 0.1, 0.04, 0))", [[0.9, 0.2, 0.4, 0.1]]),
    (f"{ROUNDED}(pgd(darkest_pixel(), {ONE}, torch.tensor([0]), 0.3, 0.1, 5))", [[0.6, 0.5, 0.7, 0.4]]),
    (f"{ROUNDED}(pgd(darkest_pixel(), torch.tensor([[[[0.3, 0.95], [1.0, 0.03]]]]), torch.tensor([2]), 0.1, 0.04, 4))", [[0.4, 1.0, 0.9, 0.13]]),
    (f"{ROUNDED}(pgd(darkest_pixel(), {THREE}, torch.tensor([0, 1, 2]), 0.1, 0.04, 2))", [[0.82, 0.28, 0.48, 0.18], [0.38, 0.77, 0.28, 0.48], [0.58, 0.28, 0.67, 0.18]]),
    (f"{ROUNDED}(pgd(small_network(), {THREE}, torch.tensor([0, 0, 0]), 0.3, 0.1, 5))", [[1.0, 0.5, 0.1, 0.4], [0.6, 1.0, 0.3, 0.7], [0.8, 0.5, 0.45, 0.4]]),
    (f"{ROUNDED}(pgd(small_network(), {THREE}, torch.tensor([2, 0, 2]), 0.2, 0.05, 6))", [[0.7, 0.0, 0.6, 0.0], [0.5, 1.0, 0.1, 0.6], [0.3, 0.0, 0.95, 0.0]]),
    (f"(lambda net, X, y, seen: [list(pgd(lambda Z: (seen.append(round((Z.detach() - X).abs().max().item(), 4)), net(Z))[1], X, y, 0.1, 0.04, 5).shape), max(seen, default=None)])(darkest_pixel(), {ONE}, torch.tensor([0]), [])", [[1, 1, 2, 2], 0.1]),
    (f"(lambda model, X, y: [pgd(model, X, y, 0.1, 0.04, 3).requires_grad, X.requires_grad, [round(v, 4) for v in X.flatten().tolist()], [p.grad for p in model.parameters()], [p.requires_grad for p in model.parameters()]])(darkest_pixel(), {ONE}, torch.tensor([0]))", [False, False, [0.9, 0.2, 0.4, 0.1], [None, None], [True, True]]),
]
