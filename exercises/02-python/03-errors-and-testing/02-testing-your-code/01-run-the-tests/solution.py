def median(numbers):
    if len(numbers) == 0:
        raise ValueError("no numbers")
    ordered = sorted(numbers)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


def broken_median(numbers):
    ordered = sorted(numbers)
    return ordered[len(ordered) // 2]


def is_exception(expected):
    return isinstance(expected, type) and issubclass(expected, BaseException)


def run_tests(function, cases):
    failures = []
    for arguments, expected in cases:
        call = f"{function.__name__}({', '.join(repr(argument) for argument in arguments)})"
        try:
            got = function(*arguments)
        except Exception as error:
            if is_exception(expected):
                if not isinstance(error, expected):
                    failures.append(f"{call} raised {type(error).__name__}, expected {expected.__name__}")
            else:
                failures.append(f"{call} raised {type(error).__name__}")
        else:
            if is_exception(expected):
                failures.append(f"{call} gave {got!r}, expected {expected.__name__}")
            elif got != expected:
                failures.append(f"{call} gave {got!r}, expected {expected!r}")
    return failures


MEDIAN_CASES = [
    (([3, 1, 2],), 2),
    (([4, 1, 3, 2],), 2.5),
    (([7],), 7),
    (([],), ValueError),
]

if __name__ == "__main__":
    print(run_tests(median, MEDIAN_CASES))
    for failure in run_tests(broken_median, MEDIAN_CASES):
        print(failure)
