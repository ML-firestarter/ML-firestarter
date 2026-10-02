CHECKS = [
    ("slope(lambda x: x ** 2, 5.0)", 10.0),
    ("slope(lambda x: x ** 2, -3.0)", -6.0),
    ("slope(lambda x: 3 * x + 8, 100.0)", 3.0),
    ("slope(lambda x: (3 * x + 8 - 23) ** 2, 4.0)", -18.0),
    ("slope(lambda x: x ** 3, 2)", 12.0),
    ("slope(lambda x: x * x * x, 2.0)", 12.0),
    ("slope(lambda x: x.exp(), 0.0)", 1.0),
    ("slope(lambda x: torch.sigmoid(x), 0.0)", 0.25),
    ("type(slope(lambda x: x ** 2, 5.0)).__name__", "float"),
]
