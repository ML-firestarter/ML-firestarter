def boundary(w, b):
    return 0


def flagged(waits, w, b):
    return []


if __name__ == "__main__":
    print(boundary(0.5, -4))
    print(flagged([2, 4, 6, 8, 10, 12, 14], 0.5, -4))
