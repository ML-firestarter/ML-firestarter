import re
import tomllib


def package_name(requirement):
    return re.match(r"[A-Za-z0-9][A-Za-z0-9._-]*", requirement.strip()).group().lower()


def dependency_names(text):
    project = tomllib.loads(text)
    requirements = project.get("project", {}).get("dependencies", [])
    return sorted(package_name(requirement) for requirement in requirements)


def dev_dependencies(text):
    project = tomllib.loads(text)
    requirements = project.get("dependency-groups", {}).get("dev", [])
    return sorted(package_name(requirement) for requirement in requirements)


HEADER = re.compile(r"(?m)^# /// script$\s(?P<content>(^#(| .*)$\s)+)^# ///$")


def script_dependencies(source):
    match = HEADER.search(source)
    if match is None:
        return []
    lines = match.group("content").splitlines(keepends=True)
    content = "".join(line[2:] if line.startswith("# ") else line[1:] for line in lines)
    return tomllib.loads(content).get("dependencies", [])


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
