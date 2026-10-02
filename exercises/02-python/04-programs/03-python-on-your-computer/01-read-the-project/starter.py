import re
import tomllib


def package_name(requirement):
    return requirement


def dependency_names(text):
    return []


def dev_dependencies(text):
    return []


HEADER = re.compile(r"(?m)^# /// script$\s(?P<content>(^#(| .*)$\s)+)^# ///$")


def script_dependencies(source):
    return []


PYPROJECT = """\
[project]
name = "fares"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "numpy>=2.4.6",
    "torch",
]

[dependency-groups]
dev = [
    "pytest>=9.1.1",
]
"""

if __name__ == "__main__":
    print(dependency_names(PYPROJECT))
    print(dev_dependencies(PYPROJECT))
    print(script_dependencies('# /// script\n# dependencies = ["rich"]\n# ///\nprint("hi")\n'))
