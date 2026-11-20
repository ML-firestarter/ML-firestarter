import csv


def read_scores(path):
    scores = {}
    with open(path, newline="") as file:
        reader = csv.reader(file)
        header = next(reader)
        for row in reader:
            scores[row[0]] = [int(text) for text in row[1:]]
    return scores, []


def averages(scores):
    return {}


def best_student(scores):
    return ""


if __name__ == "__main__":
    scores, problems = read_scores("students.csv")
    print(averages(scores))
    for problem in problems:
        print(problem)
    print(best_student(scores))
