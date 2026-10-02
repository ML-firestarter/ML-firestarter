import re

FRAME = re.compile(r'File "(?P<file>[^"]+)", line (?P<line>\d+), in (?P<function>\S+)')

AVERAGE = """Traceback (most recent call last):
  File "main.py", line 12, in <module>
    print(average([]))
  File "main.py", line 7, in average
    return total / count
ZeroDivisionError: division by zero
"""

MISSING_KEY = """Traceback (most recent call last):
  File "main.py", line 5, in <module>
    print(prices["jam"])
KeyError: 'jam'
"""

BAD_PRICE = """Traceback (most recent call last):
  File "main.py", line 20, in <module>
    report(lines)
  File "main.py", line 14, in report
    total += parse_price(line)
  File "main.py", line 9, in parse_price
    return float(text)
ValueError: could not convert string to float: 'x'
"""

BARE_RAISE = """Traceback (most recent call last):
  File "main.py", line 3, in <module>
    raise ValueError
ValueError
"""

NO_FILE = """Traceback (most recent call last):
  File "main.py", line 2, in <module>
    open("nothing.txt")
FileNotFoundError: [Errno 44] No such file or directory: 'nothing.txt'
"""

def where_it_failed(text):
    lines = text.strip().splitlines()
    frames = [FRAME.search(line) for line in lines if FRAME.search(line)]
    last = frames[-1]
    error, _, message = lines[-1].partition(": ")
    return {
        "error": error,
        "message": message,
        "function": last.group("function"),
        "line": int(last.group("line")),
    }


if __name__ == "__main__":
    print(where_it_failed(AVERAGE))
