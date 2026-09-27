def slopes(kms, fares, w, b):
    n = len(kms)
    slope_w = 0
    slope_b = 0
    for i in range(n):
        error = w * kms[i] + b - fares[i]
        slope_w += 2 * error * kms[i] / n
        slope_b += 2 * error / n
    return [slope_w, slope_b]


def step(kms, fares, w, b, learning_rate):
    gradient = slopes(kms, fares, w, b)
    new_w = w - learning_rate * gradient[0]
    new_b = b - learning_rate * gradient[1]
    return [new_w, new_b]


if __name__ == "__main__":
    kms = [2, 4, 6, 8]
    fares = [15, 23, 29, 33]
    print(slopes(kms, fares, 3, 8))
    print(step(kms, fares, 3, 8, 0.1))
