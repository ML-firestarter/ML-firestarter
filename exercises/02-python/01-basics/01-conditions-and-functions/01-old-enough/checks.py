CHECKS = [
    ("is_adult(18)", True),
    ("is_adult(17)", False),
    ("is_adult(42)", True),
    ("is_adult(0)", False),
    ("program('20')", prints("20\nTrue\n")),
    ("program('15')", prints("15\nFalse\n")),
]
