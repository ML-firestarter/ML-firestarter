---
description: Variables, input, comparisons, if and functions, for a program that tells whether someone is an adult.
---

# Conditions and functions

At the end of this lesson, you'll write a program that asks for someone's age and says whether they're an adult. It's a small program, but it needs four things that almost every program uses:

- **variables**, which keep values under a name,
- **input**, which reads what the user types,
- **conditions**, which run different code in different cases,
- **functions**, which give a piece of code a name, so you can use it again.

> [!TIP]
> Every example in this lesson runs in your browser. Press **Run** to run one, **Edit** to change it and **Undo changes** to go back to the lesson's version. Trying things out is the quickest way to learn.

## Variables

A **variable** is a name for a value. `=` gives the name its value, and from then on, the name stands for that value:

```python run
age = 20
print(age)
print(age + 1)
```

`=` doesn't say that two things are equal, as it does in maths. It's an instruction: "let `age` be 20". A variable can get a new value later, and the name then stands for the new one:

```python run
age = 20
age = age + 1
print(age)
```

The second line works out `age + 1`, which is 21, and makes that the new value of `age`.

A variable's name can have letters, digits and `_`, but it can't start with a digit. Python tells capitals apart, so `age` and `Age` are two different variables. Names of several words are written in small letters, with `_` between the words, like `user_age`.

## Reading what the user types

`input()` waits for the user to type a line, and gives back that line. Type your age in the **Input** box under the example, then press **Run**:

```python run
age = input()
print("You typed", age)
```

What `input()` gives back is always text, even when it's made of digits: `"20"`, not `20`. Text and numbers are different kinds of values, or **types**. Python calls text `str`, for string, and whole numbers `int`, for integer. `type()` tells them apart:

```python run
print(type("20"))
print(type(20))
```

`int()` turns text made of digits into a number:

```python run
text = "20"
number = int(text)
print(number + 1)
```

So a program that reads a number usually reads and converts it in one line: `age = int(input())`. Forget `int()`, and the number stays text, which doesn't mix with numbers. Python stops with a `TypeError`, an error about the types of the values:

```python run
age = "20"
print(age + 1)
```

`int()` of text that isn't a whole number, like `int("twenty")`, stops with a `ValueError` instead.

## Comparisons

A comparison checks whether something is true, and gives `True` or `False`:

```python run
age = 20
print(age >= 18)
print(age == 17)
```

| Operator | Meaning                  | Example    | Result  |
| -------- | ------------------------ | ---------- | ------- |
| `==`     | equal to                 | `5 == 5`   | `True`  |
| `!=`     | not equal to             | `5 != 5`   | `False` |
| `<`      | less than                | `3 < 5`    | `True`  |
| `<=`     | less than or equal to    | `5 <= 5`   | `True`  |
| `>`      | greater than             | `3 > 5`    | `False` |
| `>=`     | greater than or equal to | `18 >= 18` | `True`  |

`True` and `False` are values of a type of their own, `bool`, for **Boolean**. Mind the difference between `=` and `==`: `age = 18` makes `age` 18, and `age == 18` asks whether it is.

Text can be compared with text, `"yes" == "yes"` is `True`, but text can't be compared with a number. That's the mistake waiting for you in this lesson's exercise:

```python run
print("20" >= 18)
```

`and`, `or` and `not` combine comparisons:

- `a and b` is `True` when both `a` and `b` are,
- `a or b` is `True` when at least one of them is,
- `not a` is `True` when `a` is `False`, and the other way round.

```python run
age = 30
print(age >= 18 and age < 65)
print(age < 18 or age >= 65)
print(not age >= 18)
```

## Making decisions with if

`if` runs a block of code only when a condition is `True`:

```python run
age = 20
if age >= 18:
    print("You can vote.")
print("Done.")
```

The line with `if` ends with a colon, and the lines that belong to it are indented under it, by four spaces. That's how Python knows where the block ends: `print("Done.")` isn't indented, so it runs either way. Change `age` to 15 and run the example again.

`else` adds a block that runs when the condition is `False`, and `elif`, short for "else if", checks another condition when the ones before it were `False`:

```python run
age = 70
if age < 18:
    print("Child ticket")
elif age < 65:
    print("Adult ticket")
else:
    print("Senior ticket")
```

Python checks the conditions from the top and runs the block of the first one that's `True`, and only that one. The `else` block runs when none of them is. Try the ages 5, 30 and 65.

> [!NOTE]
> Indentation is part of Python, not just a matter of style. A block that isn't indented, or whose lines are indented differently, stops the program with an `IndentationError`.

## Functions

You've used functions already: `print()`, `input()`, `int()` and `type()`. A **function** is a piece of code with a name. You **call** it with its name followed by parentheses, and put the values it needs, its **arguments**, inside them.

`def` defines a function of your own:

```python run
def greet(name):
    print("Hello,", name)


greet("Ada")
greet("Alan")
```

`def` is followed by the function's name, its **parameters** in parentheses, and a colon. Under them comes the function's body, indented. Defining a function doesn't run its body. That happens each time the function is called, with each parameter set to the argument in its place: in `greet("Ada")`, `name` is `"Ada"`.

### Returning a value

`return` ends the function and gives a value back to the code that called it. That code can keep the value in a variable, print it or calculate with it:

```python run
def square(x):
    return x * x


result = square(4)
print(result)
print(square(3) + square(4))
```

`print` and `return` are easy to mix up. `print` shows a value on the screen, but the code that called the function gets nothing back. `return` gives the value back, so the code can use it. A function that ends without `return` gives back `None`, Python's value for "nothing":

```python run
def square(x):
    print(x * x)


result = square(4)
print(result)
```

A function can return the result of a comparison, `True` or `False`, so it answers a yes-or-no question:

```python run
def is_positive(number):
    return number > 0


print(is_positive(5))
print(is_positive(-2))
```

A function's body can't be empty. Until you write it, `pass`, which does nothing, can stand in for it:

```python
def to_do():
    pass
```

### Running a file as a program

The code of this course's exercises often ends like this:

```python
if __name__ == "__main__":
    age = int(input())
    print(is_adult(age))
```

`__name__` is a variable that Python sets on its own. It's `"__main__"` when the file runs as a program, as it does when you press **Run**. When other code imports the file to use its functions, `__name__` is the file's name instead, and the code under this `if` doesn't run. The page's **Check** does just that: it imports your code and calls your functions with arguments of its own, so it doesn't get stuck waiting for input that nobody types.

## Your turn

The exercise [Old enough?](../../../exercises/02-python/01-basics/01-conditions-and-functions/01-old-enough/task.md) has the program from the start of this lesson, unfinished. You'll write a function that decides whether an age is 18 or more, with a comparison and `return`, and fix the part of the program that reads the age.
