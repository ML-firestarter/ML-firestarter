CHECKS = [
    ("make_model([3.0, 0.5], 8.0).weight.tolist()", [[3.0, 0.5]]),
    ("make_model([3.0, 0.5], 8.0).bias.tolist()", [8.0]),
    ("make_model([3.0, 0.5], 8.0)(torch.tensor([[4.0, 6.0]])).item()", 23.0),
    ("tuple(make_model([1.0, 2.0, 3.0], 0.0).weight.shape)", (1, 3)),
    ("make_model([1.0, 2.0, 3.0], -1.5).bias.tolist()", [-1.5]),
    ("make_model([1.0], 0.0)(torch.tensor([[2.0], [5.0]])).flatten().tolist()", [2.0, 5.0]),
    ("make_model([3.0, 0.5], 8.0).weight.requires_grad", True),
    ("type(make_model([3.0, 0.5], 8.0)).__name__", "Linear"),
]
