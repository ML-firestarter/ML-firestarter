CHECKS = [
    ("count_vowels('')", {"a": 0, "e": 0, "i": 0, "o": 0, "u": 0, "y": 0}),
    ("count_vowels('Abracadabra')", {"a": 5, "e": 0, "i": 0, "o": 0, "u": 0, "y": 0}),
    ("count_vowels('Monty Python')", {"a": 0, "e": 0, "i": 0, "o": 2, "u": 0, "y": 2}),
    ("count_vowels('AEIOUY aeiouy')", {"a": 2, "e": 2, "i": 2, "o": 2, "u": 2, "y": 2}),
    ("program('Monty Python')", prints("Monty Python\no: 2\ny: 2\n")),
    ("program('Queue')", prints("Queue\ne: 2\nu: 2\n")),
]
