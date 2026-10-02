import csv


def read_scores(path):
    scores = {}
    problems = []
    with open(path, newline="") as file:
        reader = csv.reader(file)
        header = next(reader)
        for row in reader:
            number = reader.line_num
            if len(row) == 0:
                continue
            try:
                name, marks = check_row(row, len(header))
            except ValueError as error:
                problems.append([number, str(error)])
            else:
                scores[name] = marks
    return scores, problems


def check_row(row, columns):
    if len(row) != columns:
        raise ValueError("wrong number of columns")
    name = row[0].strip()
    if name == "":
        raise ValueError("missing name")
    marks = []
    for text in row[1:]:
        try:
            mark = int(text)
        except ValueError:
            raise ValueError(f"bad score: {text}")
        if not 0 <= mark <= 100:
            raise ValueError(f"score out of range: {mark}")
        marks.append(mark)
    return name, marks


def averages(scores):
    return {name: round(sum(marks) / len(marks), 1) for name, marks in scores.items()}


def best_student(scores):
    means = averages(scores)
    best = max(means.values())
    return min(name for name, mean in means.items() if mean == best)


if __name__ == "__main__":
    scores, problems = read_scores("students.csv")
    print(averages(scores))
    for problem in problems:
        print(problem)
    print(best_student(scores))
