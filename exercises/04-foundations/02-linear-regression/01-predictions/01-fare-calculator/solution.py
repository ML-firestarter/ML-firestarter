def predict(km, w, b):
    return w * km + b


def predict_all(kms, w, b):
    predictions = []
    for km in kms:
        predictions.append(predict(km, w, b))
    return predictions


if __name__ == "__main__":
    print(predict(5, 3, 8))
    print(predict_all([2, 4, 6, 8], 3, 8))
