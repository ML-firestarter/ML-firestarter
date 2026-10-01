CHECKS = [
    (
        "read_log('server.log')",
        {
            "INFO": [
                "server started",
                "listening on port 8080",
                "user ada logged in",
                "user alan logged in",
                "user ada logged out",
            ],
            "WARN": ["disk almost full", "response took 2300 ms"],
            "ERROR": ["cannot open database", "disk write failed"],
            "DEBUG": ["cache has 12 entries"],
        },
    ),
    ("read_log('quiet.log')", {"INFO": ["backup started", "backup finished"], "DEBUG": ["copied 140 files"]}),
    ("read_log('empty.log')", {}),
    ("worst_level(read_log('server.log'))", "ERROR"),
    ("worst_level(read_log('quiet.log'))", "INFO"),
    ("worst_level({'DEBUG': ['a'], 'WARN': ['b']})", "WARN"),
    ("worst_level({'DEBUG': ['a']})", "DEBUG"),
    ("worst_level({})", None),
    (
        "program()",
        prints(
            "ERROR (2)\n"
            "- cannot open database\n"
            "- disk write failed\n"
            "WARN (2)\n"
            "- disk almost full\n"
            "- response took 2300 ms\n"
            "INFO (5)\n"
            "- server started\n"
            "- listening on port 8080\n"
            "- user ada logged in\n"
            "- user alan logged in\n"
            "- user ada logged out\n"
            "DEBUG (1)\n"
            "- cache has 12 entries\n"
        ),
    ),
    (
        "[write_report({'INFO': ['a b'], 'ERROR': ['c']}, 'small.txt'), open('small.txt').read().splitlines()][1]",
        ["ERROR (1)", "- c", "INFO (1)", "- a b"],
    ),
    ("[write_report({}, 'none.txt'), open('none.txt').read()][1]", ""),
]
