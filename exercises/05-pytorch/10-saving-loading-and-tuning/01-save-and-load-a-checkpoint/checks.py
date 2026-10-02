SETTINGS = "{'n_inputs': 2, 'n_hidden': 3, 'n_classes': 2}"
MODEL = f"(torch.manual_seed(42), make_model(**{SETTINGS}))[1]"
CHECKS = [
    (f"sorted(make_checkpoint({MODEL}, {SETTINGS}).keys())", ["hyperparameters", "model_state_dict"]),
    (f"make_checkpoint({MODEL}, {SETTINGS})['hyperparameters']", {"n_inputs": 2, "n_hidden": 3, "n_classes": 2}),
    (f"sorted(make_checkpoint({MODEL}, {SETTINGS})['model_state_dict'].keys())", ["0.bias", "0.weight", "2.bias", "2.weight"]),
    (f"(lambda m: torch.equal(m(torch.ones(4, 2)), build_from_checkpoint(make_checkpoint(m, {SETTINGS}))(torch.ones(4, 2))))({MODEL})", True),
    (f"(lambda m, b: (torch.save(make_checkpoint(m, {SETTINGS}), b), b.seek(0), torch.equal(m(torch.ones(4, 2)), build_from_checkpoint(torch.load(b, weights_only=True))(torch.ones(4, 2))))[2])({MODEL}, __import__('io').BytesIO())", True),
    (f"build_from_checkpoint(make_checkpoint({MODEL}, {SETTINGS})).training", False),
    ("(lambda m: tuple(build_from_checkpoint(make_checkpoint(m, {'n_inputs': 4, 'n_hidden': 5, 'n_classes': 3}))[0].weight.shape))(make_model(4, 5, 3))", (5, 4)),
    (f"(lambda m: all(a.equal(b) for a, b in zip(m.parameters(), build_from_checkpoint(make_checkpoint(m, {SETTINGS})).parameters())))({MODEL})", True),
]
