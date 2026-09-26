def is_leap(year):
    if year % 400 == 0:
        return True
    if year % 100 == 0:
        return False
    return year % 4 == 0


def leap_years(start, end):
    years = []
    for year in range(start, end + 1):
        if is_leap(year):
            years.append(year)
    return years
