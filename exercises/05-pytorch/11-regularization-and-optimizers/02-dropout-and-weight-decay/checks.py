PLAIN = "torch.nn.Sequential(torch.nn.Linear(4, 8), torch.nn.ReLU(), torch.nn.Linear(8, 8), torch.nn.ReLU(), torch.nn.Linear(8, 3))"
CHECKS = [
    ("[type(layer).__name__ for layer in make_model(4, 8, 3, 0.5)]", ["Linear", "ReLU", "Dropout", "Linear", "ReLU", "Dropout", "Linear"]),
    ("[layer.p for layer in make_model(4, 8, 3, 0.25) if isinstance(layer, torch.nn.Dropout)]", [0.25, 0.25]),
    ("[tuple(parameter.shape) for parameter in make_model(4, 8, 3, 0.5).parameters()]", [(8, 4), (8,), (8, 8), (8,), (3, 8), (3,)]),
    ("[tuple(parameter.shape) for parameter in make_model(64, 100, 10, 0.2).parameters()]", [(100, 64), (100,), (100, 100), (100,), (10, 100), (10,)]),
    (f"(lambda mine, plain, x: torch.equal(mine.eval()(x), plain(x)))((torch.manual_seed(3), make_model(4, 8, 3, 0.5))[1], (torch.manual_seed(3), {PLAIN})[1], torch.ones(2, 4))", True),
    ("type(make_optimizer(make_model(4, 8, 3, 0.5), 0.01, 0.1)).__name__", "AdamW"),
    ("(lambda o: [o.param_groups[0]['lr'], o.param_groups[0]['weight_decay'], len(o.param_groups[0]['params'])])(make_optimizer(make_model(4, 8, 3, 0.5), 0.01, 0.1))", [0.01, 0.1, 6]),
    ("(lambda o: [o.param_groups[0]['lr'], o.param_groups[0]['weight_decay']])(make_optimizer(make_model(4, 8, 3, 0.0), 0.003, 0.0))", [0.003, 0.0]),
    ("tuple(predict(make_model(4, 8, 3, 0.5), torch.ones(7, 4)).shape)", (7,)),
    ("(lambda m, x: (lambda classes, training: [classes == (m.eval(), m(x).argmax(dim=1).tolist())[1], training])(predict(m, x).tolist(), m.training))((torch.manual_seed(5), make_model(4, 64, 3, 0.5))[1], torch.randn(200, 4))", [True, False]),
    ("(lambda m, x: predict(m, x).tolist() == predict(m, x).tolist())(make_model(4, 64, 3, 0.5), torch.randn(200, 4))", True),
]
