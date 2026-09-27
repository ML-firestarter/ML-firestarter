def loss(kms, fares, w, b):
    return 0


def baseline(fares):
    return 0


if __name__ == "__main__":
    kms = [2, 4, 6, 8]
    fares = [15, 23, 29, 33]
    print(loss(kms, fares, 3, 8))
    print(baseline(fares))
