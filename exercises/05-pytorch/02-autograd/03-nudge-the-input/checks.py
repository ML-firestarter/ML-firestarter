P = "torch.tensor([3.0, 0.5], requires_grad=True)"
S = "torch.tensor(8.0, requires_grad=True)"
R = "torch.tensor([4.0, 6.0])"
CHECKS = [
    (f"input_slope({P}, {S}, {R}, 30.0).tolist()", [-42.0, -7.0]),
    (f"input_slope({P}, {S}, {R}, 20.0).tolist()", [18.0, 3.0]),
    (f"input_slope({P}, {S}, {R}, 23.0).tolist()", [0.0, 0.0]),
    ("input_slope(torch.tensor([2.0, 1.0, 4.0], requires_grad=True), torch.tensor(0.0, requires_grad=True), torch.tensor([1.0, 1.0, 1.0]), 6.0).tolist()", [4.0, 2.0, 8.0]),
    (f"(lambda prices, start, ride: [input_slope(prices, start, ride, 30.0).tolist(), prices.grad, start.grad, prices.requires_grad, ride.requires_grad])({P}, {S}, {R})", [[-42.0, -7.0], None, None, True, False]),
    (f"[round(v, 4) for v in nudge({P}, {S}, {R}, 30.0, 0.1).tolist()]", [3.9, 5.9]),
    (f"[round(v, 4) for v in nudge({P}, {S}, {R}, 20.0, 0.1).tolist()]", [4.1, 6.1]),
    (f"[round(v, 4) for v in nudge({P}, {S}, {R}, 30.0, 0.5).tolist()]", [3.5, 5.5]),
    (f"nudge({P}, {S}, {R}, 23.0, 0.1).tolist()", [4.0, 6.0]),
    (f"(lambda prices, start, ride: [nudge(prices, start, ride, 30.0, 0.1).requires_grad, ride.tolist(), prices.grad, ride.requires_grad])({P}, {S}, {R})", [False, [4.0, 6.0], None, False]),
]
