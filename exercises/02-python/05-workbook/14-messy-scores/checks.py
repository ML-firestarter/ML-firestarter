CHECKS = [
    ("read_scores('students.csv')[0]", {"cy": [100, 95, 98], "fay": [88, 92, 79], "hal": [70, 80, 90]}),
    ("read_scores('students.csv')[1]", [[3, "bad score: "], [4, "bad score: x"], [5, "missing name"], [6, "wrong number of columns"], [8, "wrong number of columns"], [10, "score out of range: 120"]]),
    ("list(read_scores('students.csv')[0])", ["cy", "fay", "hal"]),
    ("len(read_scores('students.csv'))", 2),
    ("averages({'cy': [100, 95, 98], 'fay': [88, 92, 79]})", {"cy": 97.7, "fay": 86.3}),
    ("averages({'a': [70, 80, 90]})", {"a": 80.0}),
    ("averages({'a': [1, 2]})", {"a": 1.5}),
    ("averages({})", {}),
    ("best_student({'cy': [100, 95, 98], 'fay': [88, 92, 79], 'hal': [70, 80, 90]})", "cy"),
    ("best_student({'zed': [90, 90], 'amy': [90, 90], 'bo': [10, 10]})", "amy"),
    ("best_student({'only': [1]})", "only"),
    ("averages(read_scores('students.csv')[0])['hal']", 80.0),
]
