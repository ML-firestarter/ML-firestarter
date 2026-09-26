def count_words(text):
    counts = {}
    for word in text.lower().split():
        if word in counts:
            counts[word] += 1
        else:
            counts[word] = 1
    return counts


def most_common(text):
    best = ""
    best_count = 0
    for word, count in count_words(text).items():
        if count > best_count:
            best = word
            best_count = count
    return best
