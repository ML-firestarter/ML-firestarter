---
description: Read the dependencies of a project and of a script from the text of their files.
---

# Read the project

*Draws on [Python on your computer](../../../../notes/02-python/04-programs/03-python-on-your-computer.md) for `pyproject.toml` and script headers, and on [Modules and the standard library](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.md) for `re` and `tomllib`.*

`uv` keeps a project's dependencies in the file `pyproject.toml`, and a single script's in a comment at its top. Finish four functions that read them. Each gets the **text** of a file, and the code already imports `re` and `tomllib`:

- `package_name(requirement)` returns the name of the package in a requirement like `"numpy>=2.4.6"`, in lowercase, without its version, its extras in `[ ]` or its conditions after a `;`. A name is letters, digits, dots, underscores and dashes, and a requirement may have spaces around its operator, like `"Pillow ~= 10.0"`.
- `dependency_names(text)` reads the text of a `pyproject.toml` and returns the sorted names of the packages in its `[project]` `dependencies`, or `[]` when it has none.
- `dev_dependencies(text)` does the same for the list called `dev` in the `[dependency-groups]` table, which is where `uv add --dev` puts packages, and returns `[]` when there isn't one.
- `script_dependencies(source)` reads a script's source and returns the `dependencies` of its `# /// script` header, as written, in order, or `[]` when it has no header or no dependencies. The code gives you `HEADER`, the regular expression from the standard that defines these headers: its `content` group is the comment lines between `# /// script` and `# ///`. Taking `# ` off the start of each line leaves TOML.

| Call                                                           | Returns               |
| -------------------------------------------------------------- | --------------------- |
| `dependency_names` of a project with `numpy>=2.4.6` and `torch` | `['numpy', 'torch']`  |
| `dev_dependencies` of a project with `pytest>=9.1.1` in `dev`  | `['pytest']`          |
| `script_dependencies` of a script with `numpy` and `rich>=13`  | `['numpy', 'rich>=13']` |

> [!TIP]
> `tomllib.loads(text)` turns TOML into dictionaries and lists. The `[project]` table becomes `data["project"]`, and `[dependency-groups]` becomes `data["dependency-groups"]`. `dict.get(key, default)` helps when a table can be missing.
