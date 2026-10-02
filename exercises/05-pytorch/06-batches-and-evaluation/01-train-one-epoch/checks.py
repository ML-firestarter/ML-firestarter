SETUP = "(lambda m, loader: (m, loader, torch.optim.SGD(m.parameters(), lr=0.01)))(make_model([0.0, 0.0], 0.0), torch.utils.data.DataLoader(torch.utils.data.TensorDataset(X, y), batch_size={bs}))"
CHECKS = [
    (f"(lambda s: round(train_one_epoch(s[0], s[1], torch.nn.MSELoss(), s[2]), 3))({SETUP.format(bs=2)})", 315.035),
    (f"(lambda s: round(train_one_epoch(s[0], s[1], torch.nn.MSELoss(), s[2]), 3))({SETUP.format(bs=4)})", 671.0),
    (f"(lambda s: round(train_one_epoch(s[0], s[1], torch.nn.MSELoss(), s[2]), 3))({SETUP.format(bs=1)})", 152.793),
    (f"(lambda s: (train_one_epoch(s[0], s[1], torch.nn.MSELoss(), s[2]), [round(v, 3) for v in (*s[0].weight.flatten().tolist(), *s[0].bias.tolist())])[1])({SETUP.format(bs=2)})", [3.453, 2.743, 0.687]),
    (f"(lambda s: round((train_one_epoch(s[0], s[1], torch.nn.MSELoss(), s[2]), train_one_epoch(s[0], s[1], torch.nn.MSELoss(), s[2]))[1], 3))({SETUP.format(bs=2)})", 23.215),
    (f"(lambda s: round(train_one_epoch(s[0], s[1], torch.nn.MSELoss(), s[2]), 3))({SETUP.format(bs=3)})", 340.335),
    (f"type((lambda s: train_one_epoch(s[0], s[1], torch.nn.MSELoss(), s[2]))({SETUP.format(bs=2)})).__name__", "float"),
]
