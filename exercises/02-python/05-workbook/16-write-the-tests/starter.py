def is_leap(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)


def ignores_hundreds(year):
    return year % 4 == 0


def ignores_four_hundreds(year):
    return year % 4 == 0 and year % 100 != 0


def uses_two_hundreds(year):
    return year % 4 == 0 and year % 100 != 0 or year % 200 == 0


def leap_cases():
    return []


if __name__ == "__main__":
    for year, expected in leap_cases():
        print(year, expected, is_leap(year) == expected)
