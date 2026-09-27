import math

TRAINING_KMS = [1, 3, 4, 6, 8, 10, 12, 14]
NEW_KMS = [3, 4, 5]


def average(values):
    return sum(values) / len(values)


def spread(values):
    middle = average(values)
    total = 0
    for value in values:
        distance = value - middle
        total += distance * distance
    return math.sqrt(total / len(values))


def standardize(values, training):
    middle = average(training)
    size = spread(training)
    return [(value - middle) / size for value in values]


if __name__ == "__main__":
    print(average(TRAINING_KMS), round(spread(TRAINING_KMS), 3))
    print([round(x, 3) for x in standardize(NEW_KMS, TRAINING_KMS)])
    standardized = standardize(TRAINING_KMS, TRAINING_KMS)
    print(round(average(standardized), 3), round(spread(standardized), 3))
