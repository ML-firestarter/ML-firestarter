def clues(secret, guess):
    return ""


def possible_words(words, guess, pattern):
    return []


if __name__ == "__main__":
    with open("words.txt") as file:
        words = file.read().split()
    count = int(input())
    for _ in range(count):
        guess, pattern = input().split()
        words = possible_words(words, guess, pattern)
    if len(words) == 0:
        print("No word fits")
    else:
        print(", ".join(words))
