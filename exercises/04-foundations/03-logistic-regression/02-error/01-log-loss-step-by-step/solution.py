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
    result = []
    for q in qs:
        result.append(-math.log(q))
    return result


def mean(numbers):
    return sum(numbers) / len(numbers)


def log_loss(ps, ys):
    return mean(penalties(given(ps, ys)))


if __name__ == "__main__":
    ps = [0.75, 0.75, 0.5]
    ys = [1, 0, 1]
    print(given(ps, ys))
    print(log_loss(ps, ys))
