def errors(predictions, fares):
    result = []
    for i in range(len(predictions)):
        result.append(predictions[i] - fares[i])
    return result


def squares(numbers):
    result = []
    for number in numbers:
        result.append(number * number)
    return result


def mean(numbers):
    return sum(numbers) / len(numbers)


def mse(predictions, fares):
    return mean(squares(errors(predictions, fares)))


if __name__ == "__main__":
    predictions = [14, 20, 26, 32]
    fares = [15, 23, 29, 33]
    print(errors(predictions, fares))
    print(mse(predictions, fares))
