def read_grades(path):
    grades = {}
    with open(path) as file:
        for line in file:
            name, grade = line.split()
            if name not in grades:
                grades[name] = []
            grades[name].append(int(grade))
    return grades


def average_grades(grades):
    averages = {}
    for name, marks in grades.items():
        averages[name] = sum(marks) / len(marks)
    return averages


def write_report(averages, path):
    with open(path, "w") as file:
        for name in sorted(averages):
            file.write(f"{name}: {averages[name]}\n")


if __name__ == "__main__":
    grades = read_grades("grades.txt")
    write_report(average_grades(grades), "report.txt")
    with open("report.txt") as file:
        print(file.read())
