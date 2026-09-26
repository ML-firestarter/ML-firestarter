CHECKS = [
    ("read_grades('grades.txt')", {"Max": [5, 4], "Eva": [3, 4, 5], "Ada": [5, 4], "Zoe": [2, 3]}),
    ("average_grades({'Ada': [5, 4], 'Eva': [3, 4, 5]})", {"Ada": 4.5, "Eva": 4.0}),
    ("average_grades({'Kim': [2, 2, 5]})", {"Kim": 3.0}),
    ("program()", prints("Ada: 4.5\nEva: 4.0\nMax: 4.5\nZoe: 2.5\n")),
]
