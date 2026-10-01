def gcd(a, b):
    best = 1
    for number in range(1, a + 1):
        if a % number == 0 and b % number == 0:
            best = number
    return best


def simplify(top, bottom):
    if bottom == 0:
        raise ValueError("the bottom of a fraction can't be 0")
    if top == 0:
        return [0, 1]
    if bottom < 0:
        top = -top
        bottom = -bottom
    if top < 0:
        divisor = gcd(-top, bottom)
    else:
        divisor = gcd(top, bottom)
    return [top // divisor, bottom // divisor]


def add(first, second):
    first_top, first_bottom = first
    second_top, second_bottom = second
    top = first_top * second_bottom + second_top * first_bottom
    bottom = first_bottom * second_bottom
    return simplify(top, bottom)


def to_text(fraction):
    top, bottom = fraction
    top, bottom = simplify(top, bottom)
    sign = ""
    if top < 0:
        sign = "-"
        top = -top
    whole = top // bottom
    rest = top % bottom
    if rest == 0:
        return f"{sign}{whole}"
    if whole == 0:
        return f"{sign}{rest}/{bottom}"
    return f"{sign}{whole} {rest}/{bottom}"


if __name__ == "__main__":
    first_top, first_bottom = input().split("/")
    second_top, second_bottom = input().split("/")
    first = simplify(int(first_top), int(first_bottom))
    second = simplify(int(second_top), int(second_bottom))
    print(f"{to_text(first)} + {to_text(second)} = {to_text(add(first, second))}")
