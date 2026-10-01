CHECKS = [
    ("train(KMS, FARES, 0, 0.02)", (0.0, 0.0)),
    ("[round(v, 3) for v in train(KMS, FARES, 1, 0.02)]", [5.6, 1.0]),
    ("[round(v, 3) for v in train(KMS, FARES, 2, 0.02)]", [4.28, 0.84]),
    ("[round(v, 1) for v in train(KMS, FARES, 1500, 0.02)]", [3.0, 10.0]),
    ("[round(v, 3) for v in train(torch.tensor([0.0, 1.0]), torch.tensor([5.0, 7.0]), 1, 0.1)]", [0.7, 1.2]),
    ("[round(v, 2) for v in train(torch.tensor([0.0, 1.0]), torch.tensor([5.0, 7.0]), 2, 0.1)]", [1.21, 2.09]),
    ("[round(v, 2) for v in train(torch.tensor([0.0, 1.0]), torch.tensor([5.0, 7.0]), 500, 0.1)]", [2.0, 5.0]),
    ("type(train(KMS, FARES, 1, 0.02)[0]).__name__", "float"),
]
