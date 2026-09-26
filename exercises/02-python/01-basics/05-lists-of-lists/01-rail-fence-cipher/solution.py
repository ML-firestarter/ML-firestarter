def rail_fence(text, rails):
    if rails < 1:
        raise ValueError("a rail fence needs at least one rail")
    letters = text.replace(" ", "")
    if rails == 1:
        return letters

    fence = [[] for _ in range(rails)]
    row = 0
    step = 1
    for letter in letters:
        fence[row].append(letter)
        if row == 0:
            step = 1
        elif row == rails - 1:
            step = -1
        row += step

    secret = ""
    for rail in fence:
        secret += "".join(rail)
    return secret


if __name__ == "__main__":
    print(rail_fence("Podstawy pythona", 3))
