import re
import tomllib


def parse_version(version):
    return tuple(int(part) for part in version.split("."))


def allows(specifier, version):
    have = parse_version(version)
    for clause in specifier.split(","):
        clause = clause.strip()
        if clause == "":
            continue
        for operator in (">=", "<=", "==", "!=", ">", "<"):
            if clause.startswith(operator):
                break
        else:
            raise ValueError(f"unknown specifier: {clause}")
        wanted = parse_version(clause[len(operator):].strip())
        size = max(len(have), len(wanted))
        left = have + (0,) * (size - len(have))
        right = wanted + (0,) * (size - len(wanted))
        fits = {
            ">=": left >= right,
            "<=": left <= right,
            "==": left == right,
            "!=": left != right,
            ">": left > right,
            "<": left < right,
        }[operator]
        if not fits:
            return False
    return True


def best_version(specifier, versions):
    return versions[0]


REQUIREMENT = re.compile(r"\s*([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)")


def resolve(text, available):
    return {}


PYPROJECT = """\
[project]
name = "fares"
dependencies = ["numpy>=2.0,<3", "torch"]
"""

AVAILABLE = {
    "numpy": ["1.26.4", "2.0.2", "2.4.6", "3.0.0"],
    "torch": ["2.9.0", "2.10.1", "2.14.1"],
}

if __name__ == "__main__":
    print(best_version(">=2.0,<3", AVAILABLE["numpy"]))
    print(resolve(PYPROJECT, AVAILABLE))
