CHECKS = [
    ("fares(DAY, PRICES, 8).tolist()", [15.0, 23.0, 29.0, 33.0]),
    ("fares(DAY, PRICES, 0).tolist()", [7.0, 15.0, 21.0, 25.0]),
    ("tuple(fares(DAY, PRICES, 8).shape)", (4,)),
    ("fares(torch.tensor([[10.0, 0.0]]), PRICES, 8).tolist()", [38.0]),
    ("fares(torch.tensor([[1.0, 2.0, 3.0], [0.0, 0.0, 0.0]]), torch.tensor([1.0, 10.0, 100.0]), 5).tolist()", [326.0, 5.0]),
    ("takings(DAY, PRICES, 8)", 100.0),
    ("takings(torch.tensor([[5.0, 0.0], [1.0, 4.0]]), PRICES, 8)", 36.0),
]
