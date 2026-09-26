def divisors(n):
    found = []
    for divisor in range(1, n):
        if n % divisor == 0:
            found.append(divisor)
    return found


def is_perfect(n):
    return sum(divisors(n)) == n


def perfect_numbers(limit):
    return [n for n in range(1, limit + 1) if is_perfect(n)]
