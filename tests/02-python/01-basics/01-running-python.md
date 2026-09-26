# Running Python

## What does `print("2 + 3")` print?

- [x] `2 + 3`
- [ ] `5`
- [ ] `"2 + 3"`
- [ ] Nothing, because text in quotes can't be printed

The quotes make `2 + 3` text, so Python prints it as it is, without the quotes. `print(2 + 3)`, without quotes, would work it out and print `5`.

## What does `print("3 + 4 =", 3 + 4)` print?

- [ ] `3 + 4 = 3 + 4`
- [ ] `"3 + 4 =" 7`
- [x] `3 + 4 = 7`
- [ ] `3 + 4 =7`

`print()` prints each of its values in turn, with a space between them: first the text `3 + 4 =`, then the result of `3 + 4`, which is `7`.

## What does `print(9 / 3)` print?

- [ ] `3`
- [x] `3.0`
- [ ] `3.00`
- [ ] `0`

`/` always gives a float, a number with a decimal point, even when the division comes out even. `9 // 3` would give `3`.

## Which of these print `3`?

- [x] `print(7 // 2)`
- [x] `print(15 % 4)`
- [ ] `print(6 / 2)`
- [ ] `print(3 ** 2)`

2 goes into 7 three whole times, so `7 // 2` is `3`, and 15 divided by 4 leaves 3 over, so `15 % 4` is `3`. `6 / 2` prints `3.0`, as `/` always gives a float, and `3 ** 2` is 3 squared, `9`.

## What does `print(2 + 3 * 4)` print?

- [ ] `20`
- [x] `14`
- [ ] `24`
- [ ] `2 + 3 * 4`

Multiplication comes before addition, so Python works out `3 * 4` first and then adds 2. `(2 + 3) * 4` would give `20`.

## Which line does Python skip completely?

- [ ] `print("# Hello")`
- [ ] `print("Hello")  # a greeting`
- [x] `# print("Hello")`
- [ ] `print("Hello #1")`

A `#` starts a comment, and Python skips everything from it to the end of the line. In the third line that's the whole line. The second line prints `Hello` and skips only the comment after it, and a `#` inside quotes is just part of the text.

## This program's first line is missing a parenthesis. What happens when you run it?

```python
print("Hi"
print("Bye")
```

- [ ] It prints `Hi`, then stops with an error
- [ ] It prints `Hi` and `Bye`
- [ ] It prints `Bye` and skips the broken line
- [x] It stops with a `SyntaxError` and prints nothing

A `SyntaxError` means the code isn't valid Python, so Python runs none of it, not even the lines that are fine. It points at the `(` that was never closed.

## A program stops with this error message. What's wrong?

```text
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    Print("Done")
    ^^^^^
NameError: name 'Print' is not defined. Did you mean: 'print'?
```

- [x] Line 3 has `Print` with a capital P, where it should be `print`
- [ ] Line 1 is missing, since every program has to start with `print`
- [ ] `"Done"` should be in single quotes
- [ ] Lines 1 and 2 have mistakes, as the error is only noticed on line 3

Read error messages from the bottom up. The last line says what's wrong: Python knows nothing called `Print`, and it suggests `print`. The line above says where: line 3, with `^` marks under `Print`.
