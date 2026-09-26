def read_grades(path):
    grades = {}
    return grades


def average_grades(grades):
    averages = {}
    return averages


def write_report(averages, path):
    with open(path, "w") as file:
        pass


if __name__ == "__main__":
    grades = read_grades("grades.txt")
    write_report(average_grades(grades), "report.txt")
    with open("report.txt") as file:
        print(file.read())
