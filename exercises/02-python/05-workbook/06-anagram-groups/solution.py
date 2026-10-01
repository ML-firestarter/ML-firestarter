def signature(word):
    return "".join(sorted(word.lower()))


def group_anagrams(words):
    groups = {}
    for word in words:
        key = signature(word)
        if key not in groups:
            groups[key] = []
        groups[key].append(word)

    anagrams = {}
    for key, group in groups.items():
        if len(group) > 1:
            anagrams[key] = group
    return anagrams


def read_words(path):
    words = []
    with open(path) as file:
        for line in file:
            word = line.strip()
            if word != "":
                words.append(word)
    return words


if __name__ == "__main__":
    groups = group_anagrams(read_words("words.txt"))
    for key in sorted(groups):
        print(f"{key}: {', '.join(groups[key])}")
