def boundary(w, b):
    if w == 0:
        raise ValueError("with a weight of 0, the rule has no decision boundary")
    return -b / w


def flagged(waits, w, b):
    result = []
    for wait in waits:
        if w * wait + b >= 0:
            result.append(wait)
    return result


if __name__ == "__main__":
    print(boundary(0.5, -4))
    print(flagged([2, 4, 6, 8, 10, 12, 14], 0.5, -4))
