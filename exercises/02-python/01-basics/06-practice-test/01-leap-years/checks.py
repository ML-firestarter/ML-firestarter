CHECKS = [
    ("is_leap(2024)", True),
    ("is_leap(2023)", False),
    ("is_leap(1900)", False),
    ("is_leap(2000)", True),
    ("is_leap(2100)", False),
    ("leap_years(1896, 1912)", [1896, 1904, 1908, 1912]),
    ("leap_years(2001, 2003)", []),
]
