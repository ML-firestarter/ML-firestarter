CHECKS = [
    ("fares_with_fee(torch.tensor([1.0, 5.0, 10.0]), 2.0, 3.0, 8.0).tolist()", [8.0, 13.0, 23.0]),
    ("fares_with_fee(torch.tensor([0.0, 2.0]), 4.0, 5.0, 4.0).tolist()", [5.0, 13.0]),
    ("fares_with_fee(torch.tensor([1, 5, 10]), 2.0, 3.0, 8.0).tolist()", [8.0, 13.0, 23.0]),
    ("fares_with_fee(torch.tensor([[1.0], [6.0]]), 2.0, 0.0, 5.0).tolist()", [[5.0], [12.0]]),
    ("str(fares_with_fee(torch.tensor([1, 5]), 2.0, 3.0, 8.0).dtype)", "torch.float32"),
    ("share_above(torch.tensor([5.0, 10.0, 20.0, 30.0]), 12.0)", 0.5),
    ("share_above(torch.tensor([5.0, 10.0]), 100.0)", 0.0),
    ("round(share_above(torch.tensor([5.0, 10.0, 12.0]), 10.0), 4)", 0.3333),
    ("type(share_above(torch.tensor([1.0]), 0.0)).__name__", "float"),
]
