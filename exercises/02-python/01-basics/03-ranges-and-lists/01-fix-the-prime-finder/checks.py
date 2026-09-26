CHECKS = [
    ("is_prime(2)", True),
    ("is_prime(7)", True),
    ("is_prime(97)", True),
    ("is_prime(1)", False),
    ("is_prime(0)", False),
    ("is_prime(9)", False),
    ("is_prime(25)", False),
    ("primes_between(10, 20)", [11, 13, 17, 19]),
    ("primes_between(2, 7)", [2, 3, 5, 7]),
    ("primes_between(1, 13)", [2, 3, 5, 7, 11, 13]),
    ("primes_between(24, 28)", []),
    ("program('10', '20')", prints("10\n20\n11, 13, 17, 19\n")),
]
