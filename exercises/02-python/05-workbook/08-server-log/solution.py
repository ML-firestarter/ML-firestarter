# From the most severe level to the least severe.
LEVELS = ["ERROR", "WARN", "INFO", "DEBUG"]


def read_log(path):
    log = {}
    with open(path) as file:
        for line in file:
            words = line.split()
            level = words[0]
            message = " ".join(words[1:])
            if level not in log:
                log[level] = []
            log[level].append(message)
    return log


def worst_level(log):
    for level in LEVELS:
        if level in log:
            return level
    return None


def write_report(log, path):
    with open(path, "w") as file:
        for level in LEVELS:
            if level in log:
                messages = log[level]
                file.write(f"{level} ({len(messages)})\n")
                for message in messages:
                    file.write(f"- {message}\n")


if __name__ == "__main__":
    log = read_log("server.log")
    write_report(log, "report.txt")
    with open("report.txt") as file:
        print(file.read())
