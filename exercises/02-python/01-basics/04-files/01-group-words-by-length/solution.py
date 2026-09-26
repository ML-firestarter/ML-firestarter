def group_by_length(path):
    groups = {}
    with open(path) as file:
        for line in file:
            word = line.strip()
            length = len(word)
            if length not in groups:
                groups[length] = []
            groups[length].append(word)
    return dict(sorted(groups.items()))


def write_groups(groups, path):
    with open(path, "w") as file:
        for length, words in groups.items():
            file.write(f"{length}: {', '.join(words)}\n")


if __name__ == "__main__":
    groups = group_by_length("words.txt")
    write_groups(groups, "result.txt")
    with open("result.txt") as file:
        print(file.read())
