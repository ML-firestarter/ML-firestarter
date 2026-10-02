CHECKS = [
    ("where_it_failed(AVERAGE)", {"error": "ZeroDivisionError", "message": "division by zero", "function": "average", "line": 7}),
    ("where_it_failed(MISSING_KEY)", {"error": "KeyError", "message": "'jam'", "function": "<module>", "line": 5}),
    ("where_it_failed(BAD_PRICE)", {"error": "ValueError", "message": "could not convert string to float: 'x'", "function": "parse_price", "line": 9}),
    ("where_it_failed(BARE_RAISE)", {"error": "ValueError", "message": "", "function": "<module>", "line": 3}),
    ("where_it_failed(NO_FILE)", {"error": "FileNotFoundError", "message": "[Errno 44] No such file or directory: 'nothing.txt'", "function": "<module>", "line": 2}),
    ("where_it_failed(BAD_PRICE)['function']", "parse_price"),
    ("where_it_failed(BAD_PRICE.rstrip())['line']", 9),
    ("where_it_failed('\\n' + AVERAGE + '\\n')['error']", "ZeroDivisionError"),
]
