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


def rail_fence_decrypt(secret, rails):
    if rails < 1:
        raise ValueError("a rail fence needs at least one rail")

    rows = []
    row = 0
    step = 1
    for _ in secret:
        rows.append(row)
        if rails > 1:
            if row == 0:
                step = 1
            elif row == rails - 1:
                step = -1
            row += step

    pieces = []
    start = 0
    for rail in range(rails):
        length = 0
        for row in rows:
            if row == rail:
                length += 1
        pieces.append(list(secret[start:start + length]))
        start += length

    text = ""
    for row in rows:
        text += pieces[row].pop(0)
    return text


if __name__ == "__main__":
    secret = rail_fence("Podstawy pythona", 3)
    print(secret)
    print(rail_fence_decrypt(secret, 3))
