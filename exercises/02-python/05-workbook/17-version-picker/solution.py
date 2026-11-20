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
    fitting = [version for version in versions if allows(specifier, version)]
    if not fitting:
        return None
    return max(fitting, key=parse_version)


REQUIREMENT = re.compile(r"\s*([A-Za-z0-9][A-Za-z0-9._-]*)\s*(.*)")


def resolve(text, available):
    project = tomllib.loads(text)
    chosen = {}
    for requirement in project.get("project", {}).get("dependencies", []):
        name, specifier = REQUIREMENT.fullmatch(requirement).groups()
        name = name.lower()
        if name not in available:
            raise LookupError(f"unknown package: {name}")
        version = best_version(specifier, available[name])
        if version is None:
            raise LookupError(f"no version of {name} fits {specifier or 'anything'}")
        chosen[name] = version
    return chosen


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
