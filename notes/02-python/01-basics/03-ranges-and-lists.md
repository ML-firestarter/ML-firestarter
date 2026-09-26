---
description: Remainders, range, lists and bugs that don't stop a program, for a program that finds prime numbers.
---

# Ranges and lists

A **prime number** is a whole number greater than 1 that divides evenly only by 1 and by itself: 2, 3, 5, 7, 11, 13 and so on. In this lesson's exercise, you'll fix a program that lists the primes between two numbers. It runs without an error, but some of its answers are wrong, and that's the hardest kind of mistake to find, as Python can't point at it. To follow the program and fix it, you'll need:

- `%`, which tells whether one number divides another,
- `range()`, which goes through a run of numbers,
- `return` inside a loop, which ends a function as soon as it knows its answer,
- **lists**, which collect the results.

## Remainders and divisibility

`//` divides and rounds down to a whole number, and `%` gives what's left over, the **remainder**:

```python run
print(17 // 5)
print(17 % 5)
```

5 goes into 17 three whole times, with 2 left over: 17 = 3 × 5 + 2. When the remainder is 0, the division comes out even, so `n % d == 0` asks whether `d` divides `n`:

```python run
print(12 % 3 == 0)
print(12 % 5 == 0)
print(10 % 2 == 0)
```

In the same way, `n % 2 == 0` tells even numbers from odd ones.

## Counting with range

`range()` gives a run of whole numbers for a `for` loop to go through. `range(5)` counts from 0 up to 5, **but not 5 itself**:

```python run
for number in range(5):
    print(number)
```

With two numbers, `range(start, stop)` starts at `start` rather than 0, and still stops before `stop`:

```python run
for number in range(3, 7):
    print(number)
```

So `range(1, 10)` goes from 1 to 9. To include the last number, the stop has to be one more: `range(1, 11)` goes from 1 to 10. And a range whose stop isn't greater than its start is empty, so a loop over it doesn't run at all:

```python run
for number in range(5, 5):
    print(number)
print("The loop didn't run.")
```

Forgetting that `range` leaves out its stop is so common that the mistake has a name: an **off-by-one error**, where a loop runs one time too many, or one too few.

## Ending a function early

`return` ends a function at once, even in the middle of a loop. So a function that looks for something can return as soon as it finds it, and return the other answer after the loop, once it has looked everywhere and found nothing:

```python run
def has_digit(text):
    for character in text:
        if character in "0123456789":
            return True
    return False


print(has_digit("R2D2"))
print(has_digit("Python"))
```

For `"R2D2"`, the loop ends at the `2`, and the function returns `True` without looking at the rest. For `"Python"`, the loop checks every letter, finds no digit and ends, and the function goes on to `return False`.

Primes are checked the same way: a number is prime unless something divides it, so a function goes through the possible divisors, and returns `False` at the first one that divides the number.

## Modules and square roots

Python comes with **modules**, collections of ready-made functions for all sorts of tasks, which a program loads with `import`. The `math` module has mathematical functions, like `math.sqrt()` for the square root:

```python run
import math

print(math.sqrt(49))
print(math.sqrt(10))
```

`math.sqrt()` gives a **float**, a number with a decimal point. `int()` turns a float into a whole number by dropping everything after the point, without rounding:

```python run
import math

print(int(math.sqrt(10)))
print(int(3.99))
```

Square roots save a lot of work with primes. If a number `n` divides by something, it's a product `a × b` of two whole numbers, and `a` and `b` can't both be greater than √n, as their product would then be greater than `n`. So when no number from 2 up to √n divides `n`, no other number will either. For 97, that means checking the numbers from 2 to 9 rather than all those from 2 to 96.

## Lists

A **list** holds values in order. It's written in square brackets, with commas between its values:

```python run
primes = [2, 3, 5, 7]
print(primes)
print(len(primes))
print(primes[0])
```

As with strings, `len()` gives a list's length, and `[0]` picks its first item. Unlike strings, lists can change: `append()` adds an item at the end. A loop that collects results often starts from an empty list, `[]`, and appends to it as it goes:

```python run
evens = []
for number in range(1, 11):
    if number % 2 == 0:
        evens.append(number)
print(evens)
```

A **list comprehension** makes a list like that in one line: what goes in the list, then the loop, then, if it's needed, a condition:

```python run
evens = [number for number in range(1, 11) if number % 2 == 0]
squares = [number * number for number in range(1, 6)]
print(evens)
print(squares)
```

To print a list's items without the brackets, `", ".join()` puts them into one string, with `", "` between each two. It only joins strings, so numbers go through `str()` first, which turns them into text:

```python run
primes = [2, 3, 5, 7]
print(", ".join([str(prime) for prime in primes]))
print(" - ".join(["a", "b", "c"]))
```

## Bugs that don't stop a program

Some mistakes stop a program with an error message that says what went wrong and where, like the `TypeError` of a number compared with text. A mistake in the logic, like a `range` that stops one number too early, gives no error at all: the program runs to the end with a wrong answer, and nothing tells you so.

```python run
def count_up_to(n):
    return [number for number in range(1, n)]


print(count_up_to(3))
```

`count_up_to(3)` should give `[1, 2, 3]`, but the 3 is missing, as the stop should be `n + 1`. The only way to find such a mistake is to try the code on cases whose answers you know, especially the smallest ones and the ones at the edges. The page's **Check** does just that: each check calls a function with arguments whose answer is known, and says which calls come out wrong. For primes, good cases are the smallest numbers, 0, 1 and 2, and the squares of primes, like 4, 9 and 25, whose only divisor other than 1 and themselves is their square root.

## Your turn

The program in [Fix the prime finder](../../../exercises/02-python/01-basics/03-ranges-and-lists/01-fix-the-prime-finder/task.md) has three mistakes like that. Read the checks that fail, work out which line each of them points to, and fix it.
