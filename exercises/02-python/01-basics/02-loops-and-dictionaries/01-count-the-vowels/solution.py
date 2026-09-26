def count_vowels(text):
    counts = {"a": 0, "e": 0, "i": 0, "o": 0, "u": 0, "y": 0}
    for letter in text.lower():
        if letter in counts:
            counts[letter] += 1
    return counts


if __name__ == "__main__":
    text = input()
    counts = count_vowels(text)
    for vowel, count in counts.items():
        if count > 0:
            print(f"{vowel}: {count}")
