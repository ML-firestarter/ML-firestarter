ONE = "torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]]])"
THREE = "torch.tensor([[[[0.9, 0.2], [0.4, 0.1]]], [[[0.3, 0.85], [0.2, 0.4]]], [[[0.5, 0.2], [0.75, 0.1]]]])"
ROUNDED = "(lambda t: [[round(v, 4) for v in picture] for picture in t.flatten(1).tolist()])"
CHECKS = [
    (f"{ROUNDED}(fgsm(darkest_pixel(), {ONE}, torch.tensor([0]), 0.1))", [[0.8, 0.3, 0.5, 0.2]]),
    (f"{ROUNDED}(fgsm(darkest_pixel(), {ONE}, torch.tensor([0]), 0.3))", [[0.6, 0.5, 0.7, 0.4]]),
    (f"{ROUNDED}(fgsm(darkest_pixel(), torch.tensor([[[[0.3, 0.95], [1.0, 0.5]]]]), torch.tensor([2]), 0.1))", [[0.4, 1.0, 0.9, 0.6]]),
    (f"{ROUNDED}(fgsm(darkest_pixel(), torch.tensor([[[[0.05, 0.0], [0.02, 0.0]]]]), torch.tensor([0]), 0.1))", [[0.0, 0.1, 0.12, 0.1]]),
    (f"{ROUNDED}(fgsm(darkest_pixel(), {ONE}, torch.tensor([0]), 0.0))", [[0.9, 0.2, 0.4, 0.1]]),
    (f"list(fgsm(darkest_pixel(), {THREE}, torch.tensor([0, 1, 2]), 0.1).shape)", [3, 1, 2, 2]),
    (f"{ROUNDED}(fgsm(darkest_pixel(), {THREE}, torch.tensor([0, 1, 2]), 0.1))", [[0.8, 0.3, 0.5, 0.2], [0.4, 0.75, 0.3, 0.5], [0.6, 0.3, 0.65, 0.2]]),
    (f"{ROUNDED}(fgsm(small_network(), {THREE}, torch.tensor([0, 1, 2]), 0.1))", [[1.0, 0.3, 0.3, 0.2], [0.2, 0.75, 0.1, 0.5], [0.4, 0.1, 0.85, 0.0]]),
    (f"{ROUNDED}(fgsm(small_network(), {THREE}, torch.tensor([2, 0, 2]), 0.05))", [[0.85, 0.15, 0.45, 0.05], [0.35, 0.9, 0.15, 0.45], [0.45, 0.15, 0.8, 0.05]]),
    (f"(lambda model, X, y: (criterion(model(fgsm(model, X, y, 0.1)), y) > criterion(model(X), y)).item())(small_network(), {THREE}, torch.tensor([0, 1, 2]))", True),
    (f"(lambda model, X, y: [fgsm(model, X, y, 0.1).requires_grad, X.requires_grad, [p.grad for p in model.parameters()], [p.requires_grad for p in model.parameters()]])(darkest_pixel(), {ONE}, torch.tensor([0]))", [False, False, [None, None], [True, True]]),
    (f"(lambda model, X, y: [fgsm(model, X, y, 0.1).shape == X.shape, [round(v, 4) for v in X.flatten().tolist()]])(darkest_pixel(), {ONE}, torch.tensor([0]))", [True, [0.9, 0.2, 0.4, 0.1]]),
]
