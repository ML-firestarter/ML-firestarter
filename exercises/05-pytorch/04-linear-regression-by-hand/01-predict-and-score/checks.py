CHECKS = [
    ("predict(X, w, 8.0).flatten().tolist()", [15.0, 23.0, 29.0, 33.0]),
    ("tuple(predict(X, w, 8.0).shape)", (4, 1)),
    ("predict(X, w, 0.0).flatten().tolist()", [7.0, 15.0, 21.0, 25.0]),
    ("predict(torch.tensor([[1.0, 2.0, 3.0]]), torch.tensor([[1.0], [10.0], [100.0]]), 5.0).tolist()", [[326.0]]),
    ("mse(predict(X, w, 8.0), y)", 0.0),
    ("mse(predict(X, w, 0.0), y)", 64.0),
    ("mse(torch.zeros(4, 1), y)", 671.0),
    ("mse(predict(X, w, 8.0), y.flatten())", 0.0),
    ("mse(torch.zeros(4, 1), y.flatten())", 671.0),
    ("type(mse(predict(X, w, 8.0), y)).__name__", "float"),
]
