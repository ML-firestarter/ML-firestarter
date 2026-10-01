CHECKS = [
    ("signature('Evil')", "eilv"),
    ("signature('kayak')", "aakky"),
    ("signature('')", ""),
    ("signature('stale') == signature('least')", True),
    ("signature('stale') == signature('stole')", False),
    ("group_anagrams(['evil', 'tulip', 'vile', 'live'])", {"eilv": ["evil", "vile", "live"]}),
    ("group_anagrams(['Evil', 'vile'])", {"eilv": ["Evil", "vile"]}),
    ("group_anagrams(['tulip', 'kayak'])", {}),
    ("group_anagrams([])", {}),
    ("group_anagrams(['cat', 'act', 'dog', 'god', 'tac'])", {"act": ["cat", "act", "tac"], "dgo": ["dog", "god"]}),
    ("read_words('words.txt')[:3]", ["stale", "lemon", "angle"]),
    ("len(read_words('words.txt'))", 20),
    (
        "group_anagrams(read_words('words.txt'))",
        {
            "aelst": ["stale", "slate", "least", "steal"],
            "elmno": ["lemon", "melon"],
            "aegln": ["angle", "glean", "angel"],
            "below": ["below", "elbow", "bowel"],
            "eilv": ["evil", "vile", "live", "veil"],
            "dstuy": ["dusty", "study"],
        },
    ),
    (
        "program()",
        prints(
            "aegln: angle, glean, angel\n"
            "aelst: stale, slate, least, steal\n"
            "below: below, elbow, bowel\n"
            "dstuy: dusty, study\n"
            "eilv: evil, vile, live, veil\n"
            "elmno: lemon, melon\n"
        ),
    ),
]
