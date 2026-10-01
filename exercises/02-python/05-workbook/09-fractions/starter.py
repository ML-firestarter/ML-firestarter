def gcd(a, b):
    return 0


def simplify(top, bottom):
    return [0, 0]


def add(first, second):
    return [0, 0]


def to_text(fraction):
    return ""


if __name__ == "__main__":
    first_top, first_bottom = input().split("/")
    second_top, second_bottom = input().split("/")
    first = simplify(int(first_top), int(first_bottom))
    second = simplify(int(second_top), int(second_bottom))
    print(f"{to_text(first)} + {to_text(second)} = {to_text(add(first, second))}")
