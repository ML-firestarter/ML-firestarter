CHECKS = [
    ("len(leap_cases()) >= 4", True),
    ("all(isinstance(year, int) and isinstance(expected, bool) for year, expected in leap_cases())", True),
    ("len({year for year, expected in leap_cases()}) == len(leap_cases())", True),
    ("all(is_leap(year) == expected for year, expected in leap_cases())", True),
    ("any(ignores_hundreds(year) != expected for year, expected in leap_cases())", True),
    ("any(ignores_four_hundreds(year) != expected for year, expected in leap_cases())", True),
    ("any(uses_two_hundreds(year) != expected for year, expected in leap_cases())", True),
    ("any(expected for year, expected in leap_cases()) and any(not expected for year, expected in leap_cases())", True),
    ("[year for year, expected in leap_cases() if year % 100 == 0 and not expected] != []", True),
    ("[year for year, expected in leap_cases() if year % 400 == 0 and expected] != []", True),
]
