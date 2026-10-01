def clues(secret, guess):
    if len(secret) != len(guess):
        raise ValueError("the words must be the same length")

    result = ["-" for _ in guess]
    # The letters of the secret that no "G" has used up, and how many of each.
    unused = {}
    for i in range(len(secret)):
        if guess[i] == secret[i]:
            result[i] = "G"
        else:
            letter = secret[i]
            if letter in unused:
                unused[letter] += 1
            else:
                unused[letter] = 1

    for i in range(len(guess)):
        letter = guess[i]
        if result[i] != "G" and letter in unused and unused[letter] > 0:
            result[i] = "Y"
            unused[letter] -= 1
    return "".join(result)


def possible_words(words, guess, pattern):
    possible = []
    for word in words:
        if len(word) == len(guess) and clues(word, guess) == pattern:
            possible.append(word)
    return possible


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
