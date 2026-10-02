WIDE_ONLY = "(lambda m: (m.output_layer.weight.data.zero_(), m.output_layer.weight.data[:, :2].fill_(1.0), m.output_layer.bias.data.zero_(), m(torch.tensor([[1.0, 2.0], [3.0, 4.0]]), torch.tensor([[5.0, -5.0, 9.0], [0.0, 1.0, 2.0]])).tolist())[3])(WideAndDeep(2, 3))"
DEEP_ONLY = "(lambda m: (m.deep_stack[0].weight.data.fill_(1.0), m.deep_stack[0].bias.data.zero_(), m.output_layer.weight.data.zero_(), m.output_layer.weight.data[:, 2:].fill_(1.0), m.output_layer.bias.data.zero_(), m(torch.zeros(1, 2), torch.ones(1, 3)).tolist())[5])(WideAndDeep(2, 3, hidden=4))"
CHECKS = [
    ("isinstance(WideAndDeep(2, 3), torch.nn.Module)", True),
    ("sum(p.numel() for p in WideAndDeep(2, 3, hidden=4).parameters())", 23),
    ("sum(p.numel() for p in WideAndDeep(2, 3).parameters())", 43),
    ("sum(p.numel() for p in WideAndDeep(5, 1, hidden=2).parameters())", 12),
    ("[tuple(p.shape) for p in WideAndDeep(2, 3, hidden=4).parameters()]", [(4, 3), (4,), (1, 6), (1,)]),
    ("tuple(WideAndDeep(2, 3)(torch.ones(7, 2), torch.ones(7, 3)).shape)", (7, 1)),
    ("tuple(WideAndDeep(4, 2, hidden=5)(torch.ones(3, 4), torch.ones(3, 2)).shape)", (3, 1)),
    (WIDE_ONLY, [[3.0], [7.0]]),
    (DEEP_ONLY, [[12.0]]),
]
