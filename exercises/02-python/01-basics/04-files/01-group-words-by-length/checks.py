CHECKS = [
    (
        "group_by_length('words.txt')",
        {
            2: ["if", "in"],
            3: ["for", "def", "len"],
            4: ["else", "list", "dict", "open", "with"],
            5: ["print", "input", "range"],
            6: ["return"],
        },
    ),
    ("list(group_by_length('words.txt'))", [2, 3, 4, 5, 6]),
    (
        "program()",
        prints(
            "2: if, in\n"
            "3: for, def, len\n"
            "4: else, list, dict, open, with\n"
            "5: print, input, range\n"
            "6: return\n"
        ),
    ),
]
