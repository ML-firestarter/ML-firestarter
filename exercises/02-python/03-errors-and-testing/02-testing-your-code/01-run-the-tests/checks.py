CHECKS = [
    ("run_tests(median, MEDIAN_CASES)", []),
    ("run_tests(broken_median, MEDIAN_CASES)", ["broken_median([4, 1, 3, 2]) gave 3, expected 2.5", "broken_median([]) raised IndexError, expected ValueError"]),
    ("run_tests(median, [])", []),
    ("run_tests(len, [(([1, 2],), 2), (('abc',), 3)])", []),
    ("run_tests(len, [(([1, 2],), 3)])", ["len([1, 2]) gave 2, expected 3"]),
    ("run_tests(len, [(('abc', 'd'), 3)])", ["len('abc', 'd') raised TypeError"]),
    ("run_tests(len, [((5,), TypeError)])", []),
    ("run_tests(len, [((5,), ValueError)])", ["len(5) raised TypeError, expected ValueError"]),
    ("run_tests(len, [(('abc',), ValueError)])", ["len('abc') gave 3, expected ValueError"]),
    ("run_tests(len, [((5,), Exception)])", []),
    ("run_tests(abs, [((-3,), 4), ((2,), 2), ((-1,), 1), ((0,), 1)])", ["abs(-3) gave 3, expected 4", "abs(0) gave 0, expected 1"]),
    ("run_tests(max, [(([1, 5, 2],), 5), (([],), ValueError), ((), 0)])", ["max() raised TypeError"]),
]
