CHECKS = [
    ("fit_in_standard_units(torch.tensor([2.0, 4.0, 6.0, 8.0]), torch.tensor([15.0, 23.0, 29.0, 33.0]), 0.1, 300)", [3.0, 10.0]),
    ("fit_in_standard_units(torch.tensor([2.0, 4.0, 6.0, 8.0]), torch.tensor([15.0, 23.0, 29.0, 33.0]), 0.1, 0)", [0.0, 25.0]),
    ("fit_in_standard_units(torch.tensor([2.0, 4.0, 6.0, 8.0]), torch.tensor([15.0, 23.0, 29.0, 33.0]), 0.1, 1)", [0.6, 22.0]),
    ("fit_in_standard_units(torch.tensor([1.0, 3.0, 5.0]), torch.tensor([10.0, 16.0, 22.0]), 0.1, 400)", [3.0, 7.0]),
    ("fit_in_standard_units(torch.tensor([10.0, 30.0, 50.0]), torch.tensor([10.0, 16.0, 22.0]), 0.1, 400)", [0.3, 7.0]),
]
