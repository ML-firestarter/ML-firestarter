MODEL = "make_model().parameters()"
CHECKS = [
    (f"type(make_optimizer('sgd', {MODEL}, 0.1)).__name__", "SGD"),
    (f"(lambda o: [o.param_groups[0]['lr'], o.param_groups[0]['momentum']])(make_optimizer('sgd', {MODEL}, 0.1))", [0.1, 0]),
    (f"type(make_optimizer('momentum', {MODEL}, 0.1)).__name__", "SGD"),
    (f"(lambda o: [o.param_groups[0]['lr'], o.param_groups[0]['momentum']])(make_optimizer('momentum', {MODEL}, 0.05))", [0.05, 0.9]),
    (f"type(make_optimizer('adam', {MODEL}, 0.1)).__name__", "Adam"),
    (f"make_optimizer('adam', {MODEL}, 0.003).param_groups[0]['lr']", 0.003),
    (f"make_optimizer('rmsprop', {MODEL}, 0.1)", raises(ValueError)),
    ("compare(['sgd', 'momentum', 'adam'], 0.01, 20)", {"sgd": 0.1885, "momentum": 0.0692, "adam": 0.0475}),
    ("compare(['adam', 'sgd'], 0.01, 50)", {"adam": 0.0089, "sgd": 0.0358}),
    ("compare(['sgd', 'momentum', 'adam'], 0.01, 0)", {"sgd": 0.56, "momentum": 0.56, "adam": 0.56}),
    ("compare(['momentum'], 0.03, 20)", {"momentum": 0.0673}),
    ("compare([], 0.1, 10)", {}),
]
