CHECKS = [
    ("[round(v, 3) for v in standardize(DAY).flatten().tolist()]", [-1.342, -1.0, -0.447, 1.0, 0.447, 1.0, 1.342, -1.0]),
    ("tuple(standardize(DAY).shape)", (4, 2)),
    ("[round(v, 3) for v in standardize(torch.tensor([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])).flatten().tolist()]", [-1.225, -1.225, 0.0, 0.0, 1.225, 1.225]),
    ("[round(v, 3) for v in standardize(torch.tensor([[10.0, 0.0, 5.0], [20.0, 4.0, 5.5]])).flatten().tolist()]", [-1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
    ("[round(v, 3) for v in standardize_like(DAY, torch.tensor([[7.0, 8.0], [3.0, 0.0]])).flatten().tolist()]", [0.894, 2.0, -0.894, -2.0]),
    ("standardize_like(DAY, torch.tensor([[5.0, 4.0]])).tolist()", [[0.0, 0.0]]),
    ("tuple(standardize_like(DAY, torch.tensor([[7.0, 8.0], [3.0, 0.0], [5.0, 4.0]])).shape)", (3, 2)),
    ("[round(v, 6) for v in standardize(DAY).mean(dim=0).tolist()]", [0.0, 0.0]),
    ("[round(v, 3) for v in standardize(DAY).std(dim=0, correction=0).tolist()]", [1.0, 1.0]),
]
