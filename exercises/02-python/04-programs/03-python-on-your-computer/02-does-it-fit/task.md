---
description: Decide whether a version of a package satisfies a version specifier like >=2.0,<3.
---

# Does it fit

*Draws on [Python on your computer](../../../../notes/02-python/04-programs/03-python-on-your-computer.md) for version specifiers, and on [Conditions and functions](../../../../notes/02-python/01-basics/01-conditions-and-functions.md) and [Ranges and lists](../../../../notes/02-python/01-basics/03-ranges-and-lists.md) for the comparisons and loops.*

`uv add "numpy>=2.0,<3"` asks for a version of numpy that is at least 2.0 and below 3. Finish `allows(specifier, version)`, which says whether a version fits a specifier. The code gives you `parse_version("2.4.6")`, which turns a version into the tuple `(2, 4, 6)`, and tuples compare number by number.

- A specifier is clauses separated by commas, like `">=2.0,<3"`. A version fits only when it fits **every** clause. Spaces around a clause don't matter, and an empty specifier fits any version.
- A clause is an operator and a version: `>=`, `<=`, `==`, `!=`, `>` or `<`. Any other operator, like `~=`, raises a `ValueError`.
- Versions with a different number of parts are compared as if the shorter one ended in zeros: `2.4` is the same version as `2.4.0`.
- Versions are compared as numbers, not as text, so `1.10` is above `1.9`.

| Call                          | Returns |
| ----------------------------- | ------- |
| `allows(">=2.0,<3", "2.4.6")` | `True`  |
| `allows(">=2.0,<3", "3.0")`   | `False` |
| `allows("==2.4", "2.4.0")`    | `True`  |
| `allows(">=1.9", "1.10")`     | `True`  |
| `allows("~=2.0", "2.1")`      | raises `ValueError` |

> [!TIP]
> Pad both tuples with zeros to the same length, as in `have + (0,) * (size - len(have))`, and compare them with the operator of the clause.
