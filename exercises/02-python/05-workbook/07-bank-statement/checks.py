CHECKS = [
    (
        "read_transactions('account.txt')",
        [["deposit", 500], ["withdraw", 120], ["deposit", 75], ["withdraw", 300], ["deposit", 40]],
    ),
    ("len(read_transactions('overdraft.txt'))", 3),
    ("read_transactions('strange.txt')", raises(ValueError)),
    ("balances([['deposit', 500], ['withdraw', 120], ['deposit', 75]])", [500, 380, 455]),
    ("balances([['deposit', 10], ['withdraw', 10]])", [10, 0]),
    ("balances([])", []),
    ("balances([['withdraw', 5]])", raises(ValueError)),
    ("balances(read_transactions('account.txt'))", [500, 380, 455, 155, 195]),
    ("balances(read_transactions('overdraft.txt'))", raises(ValueError)),
    (
        "program()",
        prints(
            "deposit 500 -> 500\n"
            "withdraw 120 -> 380\n"
            "deposit 75 -> 455\n"
            "withdraw 300 -> 155\n"
            "deposit 40 -> 195\n"
            "Balance: 195\n"
        ),
    ),
    (
        "[write_statement([['deposit', 20], ['withdraw', 5]], 'small.txt'), open('small.txt').read().splitlines()][1]",
        ["deposit 20 -> 20", "withdraw 5 -> 15", "Balance: 15"],
    ),
    (
        "[write_statement([], 'empty.txt'), open('empty.txt').read().splitlines()][1]",
        ["Balance: 0"],
    ),
]
