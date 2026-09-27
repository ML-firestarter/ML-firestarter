import math


def given(ps, ys):
    result = []
    for i in range(len(ps)):
        if ys[i] == 1:
            result.append(ps[i])
        else:
            result.append(1 - ps[i])
    return result


def penalties(qs):
    return []


def mean(numbers):
    return 0


def log_loss(ps, ys):
    return 0


if __name__ == "__main__":
    ps = [0.75, 0.75, 0.5]
    ys = [1, 0, 1]
    print(given(ps, ys))
    print(log_loss(ps, ys))
