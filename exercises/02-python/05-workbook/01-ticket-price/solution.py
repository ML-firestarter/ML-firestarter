def ticket_price(age, student):
    if age < 12:
        return 20
    if age >= 65:
        return 25
    if student:
        return 30
    return 35


def group_price(ages, student):
    total = 0
    for age in ages:
        total += ticket_price(age, student)
    return total


if __name__ == "__main__":
    age = int(input())
    student = input() == "yes"
    print(f"Price: {ticket_price(age, student)}")
