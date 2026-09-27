def train(kms, fares, learning_rate, steps):
    n = len(kms)
    w = 0
    b = 0
    for step in range(steps):
        slope_w = 0
        slope_b = 0
        for i in range(n):
            error = w * kms[i] + b - fares[i]
            slope_w += 2 * error * kms[i] / n
            slope_b += 2 * error / n
        w = w - learning_rate * slope_w
        b = b - learning_rate * slope_b
    return [w, b]


if __name__ == "__main__":
    kms = [2, 4, 6, 8]
    fares = [15, 23, 29, 33]
    print(train(kms, fares, 0.01, 5000))
