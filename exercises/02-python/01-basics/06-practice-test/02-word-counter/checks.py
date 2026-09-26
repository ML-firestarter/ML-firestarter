CHECKS = [
    ("count_words('')", {}),
    ("count_words('the cat and the hat')", {"the": 2, "cat": 1, "and": 1, "hat": 1}),
    ("count_words('Yes yes YES')", {"yes": 3}),
    ("most_common('The cat and the hat')", "the"),
    ("most_common('one two two three three')", "two"),
    ("most_common('red green blue')", "red"),
]
