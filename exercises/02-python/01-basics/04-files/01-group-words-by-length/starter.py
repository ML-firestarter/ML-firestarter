def group_by_length(path):
    groups = {}
    return groups


def write_groups(groups, path):
    with open(path, "w") as file:
        pass


if __name__ == "__main__":
    groups = group_by_length("words.txt")
    write_groups(groups, "result.txt")
    with open("result.txt") as file:
        print(file.read())
