def tariff(km1, fare1, km2, fare2):
    if km1 == km2:
        raise ValueError("both receipts are for the same distance")
    w = (fare2 - fare1) / (km2 - km1)
    b = fare1 - w * km1
    return [w, b]


if __name__ == "__main__":
    print(tariff(3, 17, 7, 29))
