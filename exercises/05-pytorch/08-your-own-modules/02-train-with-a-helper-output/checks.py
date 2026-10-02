SETUP = "(lambda m: (m, torch.utils.data.DataLoader(torch.utils.data.TensorDataset(X_wide, X_deep, y), batch_size={bs}), torch.optim.SGD(m.parameters(), lr=0.1)))((torch.manual_seed(0), WithHelper(1, 2))[1])"
LOSS = "(lambda s: round(train_one_epoch(s[0], s[1], s[2], torch.nn.MSELoss(), {w}), 4))({setup})"
BIASES = "(lambda s: (train_one_epoch(s[0], s[1], s[2], torch.nn.MSELoss(), 0.5), [round(v, 4) for v in s[0].output_layer.bias.tolist() + s[0].aux_layer.bias.tolist()])[1])({setup})"
TWICE = "(lambda s: (train_one_epoch(s[0], s[1], s[2], torch.nn.MSELoss(), 0.5), round(train_one_epoch(s[0], s[1], s[2], torch.nn.MSELoss(), 0.5), 4))[1])({setup})"
CHECKS = [
    (LOSS.format(w=0.5, setup=SETUP.format(bs=2)), 1.0495),
    (LOSS.format(w=0.0, setup=SETUP.format(bs=2)), 0.7691),
    (LOSS.format(w=1.0, setup=SETUP.format(bs=2)), 1.3124),
    (LOSS.format(w=0.5, setup=SETUP.format(bs=4)), 1.1055),
    (LOSS.format(w=0.5, setup=SETUP.format(bs=1)), 1.0779),
    (LOSS.format(w=0.5, setup=SETUP.format(bs=3)), 0.7537),
    (BIASES.format(setup=SETUP.format(bs=2)), [0.3356, -0.0088]),
    (TWICE.format(setup=SETUP.format(bs=2)), 0.692),
    ("type((lambda s: train_one_epoch(s[0], s[1], s[2], torch.nn.MSELoss(), 0.5))(" + SETUP.format(bs=2) + ")).__name__", "float"),
]
