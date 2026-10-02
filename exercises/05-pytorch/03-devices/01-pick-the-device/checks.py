CHECKS = [
    ("choose_device(False, False)", "cpu"),
    ("choose_device(True, False)", "cuda"),
    ("choose_device(False, True)", "mps"),
    ("choose_device(True, True)", "cuda"),
    ("get_device() == choose_device(torch.cuda.is_available(), torch.backends.mps.is_available())", True),
]
