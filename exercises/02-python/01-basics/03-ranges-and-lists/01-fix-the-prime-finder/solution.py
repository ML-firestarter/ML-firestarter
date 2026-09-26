import math


def is_prime(n):
    if n < 2:
        return False
    for divisor in range(2, int(math.sqrt(n)) + 1):
        if n % divisor == 0:
            return False
    return True


def primes_between(low, high):
    primes = []
    for n in range(low, high + 1):
        if is_prime(n):
            primes.append(n)
    return primes


if __name__ == "__main__":
    low = int(input())
    high = int(input())
    primes = primes_between(low, high)
    print(", ".join([str(n) for n in primes]))
