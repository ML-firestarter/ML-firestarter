GRID = "[0.0001, 0.01, 0.1, 0.2]"
CHECKS = [
    (f"search({GRID})['learning_rate']", 0.2),
    (f"round(search({GRID})['valid_rmse'], 2)", 0.73),
    ("search([0.2, 0.0001])['learning_rate']", 0.2),
    ("search([0.0001])['learning_rate']", 0.0001),
    ("search([0.0001, 0.01])['learning_rate']", 0.01),
    (f"sorted(search({GRID}).keys())", ["learning_rate", "model_state_dict", "valid_rmse"]),
    ("sorted(search([0.01])['model_state_dict'].keys())", ["bias", "weight"]),
    (f"abs(evaluate(load_best(search({GRID})), valid_loader) - search({GRID})['valid_rmse']) < 0.0001", True),
    (f"load_best(search({GRID})).training", False),
    ("(lambda b, c: (torch.save(c, b), b.seek(0), round(evaluate(load_best(torch.load(b, weights_only=True)), valid_loader), 2))[2])(__import__('io').BytesIO(), search([0.1]))", 0.73),
]
