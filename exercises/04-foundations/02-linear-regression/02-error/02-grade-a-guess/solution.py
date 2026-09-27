def loss(kms, fares, w, b):
    total = 0
    for i in range(len(kms)):
        error = w * kms[i] + b - fares[i]
        total += error * error
    return total / len(kms)


def baseline(fares):
    average = sum(fares) / len(fares)
    total = 0
    for fare in fares:
        error = average - fare
        total += error * error
    return total / len(fares)


if __name__ == "__main__":
    kms = [2, 4, 6, 8]
    fares = [15, 23, 29, 33]
    print(loss(kms, fares, 3, 8))
    print(baseline(fares))
