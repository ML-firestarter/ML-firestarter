def errors(predictions, fares):
    result = []
    for i in range(len(predictions)):
        result.append(predictions[i] - fares[i])
    return result


def squares(numbers):
    return []


def mean(numbers):
    return 0


def mse(predictions, fares):
    return 0


if __name__ == "__main__":
    predictions = [14, 20, 26, 32]
    fares = [15, 23, 29, 33]
    print(errors(predictions, fares))
    print(mse(predictions, fares))
