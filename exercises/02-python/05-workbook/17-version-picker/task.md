---
description: Pick the newest version of each dependency in a pyproject.toml that fits its specifier, the way uv does, and say clearly when none does.
---

# Version picker

*Draws on [Python on your computer](../../../../notes/02-python/04-programs/03-python-on-your-computer.md) for `pyproject.toml` and version specifiers, [Modules and the standard library](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.md) for `tomllib` and `re`, and [Exceptions](../../../../notes/02-python/03-errors-and-testing/01-exceptions.md) for raising errors.*

When you run `uv add`, it has to choose which version of every library to install: the newest one that fits what the project asks for. Here is that choice in small. The code gives you `parse_version`, `allows(specifier, version)` from the exercise *Does it fit*, a regular expression `REQUIREMENT` that splits a requirement like `"numpy >= 2.0,<3"` into a name and a specifier, and `AVAILABLE`, a dictionary from each package's name to the list of its versions. Finish two functions:

- `best_version(specifier, versions)` returns the **highest** version in `versions` that fits the specifier, or `None` when none does. Versions are compared as numbers, so `1.10` is above `1.9`, and an empty specifier fits them all.
- `resolve(text, available)` reads the text of a `pyproject.toml`, and returns a dictionary from the name of each package in its `[project]` `dependencies`, in lowercase, to the version chosen for it from `available[name]`. A project with no dependencies gives `{}`.

`resolve` refuses what it can't do with a `LookupError`, a kind of error for something that isn't there. The message names the package: `unknown package: scipy` when `available` doesn't have it, and `no version of numpy fits >=4` when none of its versions does, with the specifier as it was written, without spaces around it.

| Call                                                   | Returns                                         |
| ------------------------------------------------------ | ----------------------------------------------- |
| `best_version(">=2.0,<3", ["1.26.4", "2.4.6", "3.0.0"])` | `"2.4.6"`                                       |
| `best_version(">=4", ["2.9.0"])`                       | `None`                                          |
| `resolve` of `["numpy>=2.0,<3", "torch"]` with `AVAILABLE` | `{"numpy": "2.4.6", "torch": "2.14.1"}`     |

The program under the functions prints the choice for the `numpy` and for the whole project.

> [!TIP]
> `max(fitting, key=parse_version)` compares the versions as tuples of numbers. `REQUIREMENT.fullmatch(requirement).groups()` gives the name and the specifier of a requirement, and `.strip()` takes the spaces off the specifier.
