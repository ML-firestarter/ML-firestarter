# From the most severe level to the least severe.
LEVELS = ["ERROR", "WARN", "INFO", "DEBUG"]


def read_log(path):
    log = {}
    return log


def worst_level(log):
    return ""


def write_report(log, path):
    with open(path, "w") as file:
        pass


if __name__ == "__main__":
    log = read_log("server.log")
    write_report(log, "report.txt")
    with open("report.txt") as file:
        print(file.read())
