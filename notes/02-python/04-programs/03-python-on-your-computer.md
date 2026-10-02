---
description: Set up Python on your own computer with uv, keep a project's dependencies in pyproject.toml, and run the lessons' code there.
---

# Python on your computer

The page runs Python for you, and that's enough for most of these lessons. It stops short in a few places: it has no graphics card, it can't download big datasets, and the PyTorch it runs is a small copy of the real one. Real projects live on your own computer, with files of their own and libraries they install. This lesson sets that up with **uv**, a fast tool that installs Python and the libraries a project needs.

In this lesson's exercises, you'll read what `uv` writes and decide what it will install. You'll need:

- the **commands** that make a project and add libraries to it,
- **`pyproject.toml`**, the file where a project lists its dependencies,
- **version specifiers**, like `>=2.0,<3`, which say which versions are fine,
- **script headers**, which let a single file carry its own dependencies.

> [!NOTE]
> The commands in this lesson run in a terminal on your computer, so the page can't run them, and they're shown as plain blocks. What the page can run is the Python that reads the files they write, and that's what the exercises are. The project commands were run with `uv` before they went in. The installer and PyTorch's command come from their own documentation.

## What uv does

A computer can have many versions of Python, and each project needs its own libraries, in versions that work together. A project that needs `numpy` 2 shouldn't break one that needs `numpy` 1, so each project gets a **virtual environment**: a folder with its own Python and its own libraries. A **lockfile** records the exact versions that were installed, so the project works the same on another computer.

`uv` does all of that, in one tool. It installs Pythons, makes the virtual environments, adds libraries to them and writes the lockfile. It replaces a handful of older tools, `pip`, `venv`, `pyenv` and `pipx`, which each did a part.

## Installing uv

On macOS and Linux, run this in a terminal:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

On Windows, run this in PowerShell:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Open a new terminal, and `uv --version` shows that it's there. The [uv documentation](https://docs.astral.sh/uv/getting-started/installation/) lists other ways, like `brew install uv` or `pip install uv`.

## A project

`uv init` makes a project in a new folder:

```bash
uv init fares
cd fares
```

The folder holds a few files:

| File               | What it is                                                              |
| ------------------ | ----------------------------------------------------------------------- |
| `pyproject.toml`   | the project's name and its dependencies, written by you and by `uv`     |
| `main.py`          | a small program to start from                                           |
| `.python-version`  | which version of Python the project uses                                |
| `README.md`        | a place to say what the project is                                      |

`pyproject.toml` is a TOML file, a plain text format of `key = value` lines in `[tables]`. Python can read it with the standard library's `tomllib`, which is how the exercises will:

```python run
import tomllib

text = """\
[project]
name = "fares"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "numpy>=2.4.6",
]
"""

project = tomllib.loads(text)
print(project["project"]["name"])
print(project["project"]["dependencies"])
```

A table like `[project]` becomes a dictionary, and a list in square brackets a Python list. The `dependencies` are the libraries the project needs, each with a **version specifier** after its name.

## Adding libraries

`uv add` installs a library into the project:

```bash
uv add numpy
```

It does three things. It makes a virtual environment in a folder called `.venv`, if the project doesn't have one yet. It installs numpy there, with whatever it needs. And it writes numpy into `pyproject.toml`, which now has `dependencies = ["numpy>=2.4.6"]`, and every exact version into a second file, `uv.lock`. Don't edit `uv.lock` by hand: `uv` keeps it.

Libraries you only use while developing, like a testing tool, go in a separate group with `--dev`, and `uv remove` takes one out again:

```bash
uv add --dev pytest
uv remove numpy
```

The dev group is written in its own table, `[dependency-groups]`:

```toml
[dependency-groups]
dev = [
    "pytest>=9.1.1",
]
```

On another computer, or after pulling a project from Git, `uv sync` installs exactly what `uv.lock` lists.

## Running code

`uv run` runs a program with the project's environment, so there's nothing to activate:

```bash
uv run main.py
```

It makes sure that the environment matches `pyproject.toml` first, so a library you've just added is there. `uv run python` starts a Python prompt in the same environment, and `uv run pytest` runs a tool the project installed.

The usual surprise for a beginner is a `ModuleNotFoundError` for a library that's definitely installed. It almost always means that the program ran with a different Python than the project's. Running it with `uv run` is the fix.

## Which version

Libraries have versions, like `2.4.6`, and the specifier says which ones the project accepts:

| Specifier   | Fits versions                          |
| ----------- | -------------------------------------- |
| `>=2.0`     | 2.0 and above                          |
| `>=2.0,<3`  | from 2.0 up to, but not including, 3   |
| `==2.4.6`   | exactly 2.4.6                          |
| `!=2.4.6`   | any version but 2.4.6                  |

Clauses separated by commas all have to hold. `uv add numpy` writes `numpy>=2.4.6`, for the version it installed, and the lockfile keeps the exact one. Versions are numbers separated by dots, and they're compared part by part as numbers, which is why `1.10` is newer than `1.9`. Python's tuples compare the same way:

```python run
print((1, 10) > (1, 9))
print("1.10" > "1.9")
print((2, 4, 6) >= (2, 0) and (2, 4, 6) < (3,))
```

The second line compares the *text*, and gets it wrong. The exercise turns the versions into tuples first.

Python itself has a version too. `requires-python = ">=3.12"` in `pyproject.toml` says which ones the project works with, and `.python-version` says which one to use. `uv python install 3.13` installs another one, and `uv python pin 3.13` makes the project use it.

## A script that carries its dependencies

A single file doesn't need a project. A comment block at the top of a script lists what it needs, in the TOML you've just seen, with each line starting with `# `:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "numpy",
# ]
# ///
import numpy as np

print(np.ones(2))
```

`uv run script.py` reads the block, makes a temporary environment with numpy in it and runs the script, so that file works on any computer with `uv`. `uv add --script script.py numpy` writes the block for you. For a one-off, `uv run --with rich python` runs Python with `rich` available and keeps nothing.

Reading the block is a short job for the `re` module and `tomllib`, and it's the second thing the exercise does.

## The PyTorch chapter, on your computer

Everything in the [PyTorch chapter](../05-pytorch/README.md) runs unchanged on your computer. In a new project:

```bash
uv init torch-lessons
cd torch-lessons
uv add torch
```

Put a lesson's code in `main.py` and `uv run main.py` runs it with the real PyTorch, which prints what the page's copy did. PyTorch is a big download, and the right build for a graphics card depends on your computer: [PyTorch's install page](https://pytorch.org/get-started/locally/) has the command for it, which is also the place to check whether `torch.cuda.is_available()` can be `True` for you.

## Commands at a glance

| Command                    | What it does                                          |
| -------------------------- | ----------------------------------------------------- |
| `uv init name`             | makes a project in a new folder                       |
| `uv add library`           | installs a library and writes it to `pyproject.toml`  |
| `uv add --dev library`     | the same, in the `dev` group                          |
| `uv remove library`        | takes a library out                                   |
| `uv sync`                  | installs what `uv.lock` lists                         |
| `uv run file.py`           | runs a program in the project's environment           |
| `uv python install 3.13`   | installs a version of Python                          |

Commit `pyproject.toml`, `uv.lock` and `.python-version` to Git, and leave out `.venv`: it can be made again from the others, and `uv init` already lists it in `.gitignore`.

## Your turn

In [Read the project](../../../exercises/02-python/04-programs/03-python-on-your-computer/01-read-the-project/task.md), you'll read the dependencies out of a `pyproject.toml` and out of a script's header. In [Does it fit](../../../exercises/02-python/04-programs/03-python-on-your-computer/02-does-it-fit/task.md), you'll decide whether a version fits a specifier like `>=2.0,<3`.
