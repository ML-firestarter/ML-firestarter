PICTURE = "torch.tensor([[[255, 0, 0], [0, 128, 255]]], dtype=torch.uint8)"
TALL = "torch.arange(24, dtype=torch.uint8).reshape(4, 2, 3)"
CHECKS = [
    (f"tuple(to_tensor({PICTURE}).shape)", (3, 1, 2)),
    (f"str(to_tensor({PICTURE}).dtype)", "torch.float32"),
    (f"[round(v, 4) for v in to_tensor({PICTURE}).flatten().tolist()]", [1.0, 0.0, 0.0, 0.502, 0.0, 1.0]),
    (f"tuple(to_tensor({TALL}).shape)", (3, 4, 2)),
    (f"[round(v * 255) for v in to_tensor({TALL})[0].flatten().tolist()]", [0, 3, 6, 9, 12, 15, 18, 21]),
    (f"tuple(to_picture(to_tensor({PICTURE})).shape)", (1, 2, 3)),
    (f"str(to_picture(to_tensor({PICTURE})).dtype)", "torch.uint8"),
    (f"to_picture(to_tensor({PICTURE})).tolist()", [[[255, 0, 0], [0, 128, 255]]]),
    (f"to_picture(to_tensor({TALL})).tolist() == {TALL}.tolist()", True),
    ("to_picture(torch.tensor([[[0.05, 0.25]], [[0.6, 0.75]], [[0.0, 1.0]]])).tolist()", [[[13, 153, 0], [64, 191, 255]]]),
    ("to_picture(torch.tensor([[[1.5, -0.2]], [[0.25, 2.0]], [[-3.0, 1.0]]])).tolist()", [[[255, 64, 0], [0, 255, 255]]]),
]
