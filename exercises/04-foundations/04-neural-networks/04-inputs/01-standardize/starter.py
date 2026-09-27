import math

TRAINING_KMS = [1, 3, 4, 6, 8, 10, 12, 14]
NEW_KMS = [3, 4, 5]


def average(values):
    return 0


def spread(values):
    return 0


def standardize(values, training):
    return values


if __name__ == "__main__":
    print(average(TRAINING_KMS), round(spread(TRAINING_KMS), 3))
    print([round(x, 3) for x in standardize(NEW_KMS, TRAINING_KMS)])
    standardized = standardize(TRAINING_KMS, TRAINING_KMS)
    print(round(average(standardized), 3), round(spread(standardized), 3))
