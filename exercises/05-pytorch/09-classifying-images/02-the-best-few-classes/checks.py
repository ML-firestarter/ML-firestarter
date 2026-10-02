LOGITS = "torch.tensor([[2.0, 0.5, -1.0, 1.0], [0.1, 0.2, 0.9, 3.0]])"
CHECKS = [
    (f"best_classes({LOGITS}, 2)[0]", [[0, 3], [3, 2]]),
    (f"best_classes({LOGITS}, 3)[0]", [[0, 3, 1], [3, 2, 1]]),
    (f"best_classes({LOGITS}, 1)[0]", [[0], [3]]),
    (f"[[round(p, 4) for p in row] for row in best_classes({LOGITS}, 2)[1].tolist()]", [[0.7311, 0.2689], [0.8909, 0.1091]]),
    (f"[[round(p, 4) for p in row] for row in best_classes({LOGITS}, 3)[1].tolist()]", [[0.6285, 0.2312, 0.1402], [0.8451, 0.1035, 0.0514]]),
    (f"[round(v, 4) for v in best_classes({LOGITS}, 3)[1].sum(dim=1).tolist()]", [1.0, 1.0]),
    (f"tuple(best_classes({LOGITS}, 2)[1].shape)", (2, 2)),
    (f"type(best_classes({LOGITS}, 2)[0]).__name__", "list"),
]
