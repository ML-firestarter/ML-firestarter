ONE = "torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]]])"
THREE = "torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]], [[[0.3, 0.85], [0.2, 0.4]]], [[[0.5, 0.2], [0.75, 0.1]]]])"
ROUNDED = "(lambda t: [[round(v, 4) for v in picture] for picture in t.flatten(1).tolist()])"
CHECKS = [
    (f"{ROUNDED}(targeted_pgd(darkest_pixel(), {ONE}, torch.tensor([2]), 0.1, 0.04, 1))", [[0.86, 0.16, 0.44, 0.06]]),
    (f"{ROUNDED}(targeted_pgd(darkest_pixel(), {ONE}, torch.tensor([2]), 0.1, 0.04, 3))", [[0.8, 0.1, 0.5, 0.0]]),
    (f"{ROUNDED}(targeted_pgd(darkest_pixel(), {ONE}, torch.tensor([2]), 0.3, 0.1, 5))", [[0.6, 0.0, 0.7, 0.0]]),
    (f"{ROUNDED}(targeted_pgd(darkest_pixel(), {ONE}, torch.tensor([3]), 0.5, 0.1, 6))", [[0.4, 0.0, 0.0, 0.6]]),
    (f"{ROUNDED}(targeted_pgd(darkest_pixel(), {ONE}, torch.tensor([0]), 0.1, 0.04, 3))", [[1.0, 0.1, 0.3, 0.0]]),
    (f"{ROUNDED}(targeted_pgd(darkest_pixel(), {ONE}, torch.tensor([2]), 0.1, 0.04, 0))", [[0.9, 0.2, 0.4, 0.1]]),
    (f"(lambda model, X: model(targeted_pgd(model, X, torch.tensor([2]), 0.3, 0.1, 5)).argmax(dim=1).tolist())(darkest_pixel(), {ONE})", [2]),
    (f"{ROUNDED}(targeted_pgd(darkest_pixel(), {THREE}, torch.tensor([1, 2, 0]), 0.3, 0.1, 5))", [[0.6, 0.5, 0.1, 0.0], [0.0, 0.55, 0.5, 0.1], [0.8, 0.0, 0.45, 0.0]]),
    (f"{ROUNDED}(targeted_pgd(small_network(), {THREE}, torch.tensor([2, 0, 2]), 0.2, 0.05, 6))", [[1.0, 0.4, 0.2, 0.3], [0.1, 0.65, 0.4, 0.2], [0.7, 0.4, 0.55, 0.3]]),
    (f"{ROUNDED}(targeted_pgd(small_network(), {THREE}, torch.tensor([2, 1, 2]), 0.2, 0.05, 6))", [[1.0, 0.4, 0.2, 0.3], [0.4, 1.0, 0.4, 0.2], [0.7, 0.4, 0.55, 0.3]]),
    (f"(lambda model, X, target: (criterion(model(targeted_pgd(model, X, target, 0.2, 0.05, 6)), target) < criterion(model(X), target)).item())(small_network(), {THREE}, torch.tensor([2, 1, 2]))", True),
    (f"(lambda net, X, target, seen: [list(targeted_pgd(lambda Z: (seen.append(round((Z.detach() - X).abs().max().item(), 4)), net(Z))[1], X, target, 0.1, 0.04, 5).shape), max(seen, default=None)])(darkest_pixel(), {ONE}, torch.tensor([2]), [])", [[1, 1, 2, 2], 0.1]),
    (f"(lambda model, X, target: [targeted_pgd(model, X, target, 0.1, 0.04, 3).requires_grad, X.requires_grad, [round(v, 4) for v in X.flatten().tolist()], [p.grad for p in model.parameters()], [p.requires_grad for p in model.parameters()]])(darkest_pixel(), {ONE}, torch.tensor([2]))", [False, False, [0.9, 0.2, 0.4, 0.1], [None, None], [True, True]]),
]
