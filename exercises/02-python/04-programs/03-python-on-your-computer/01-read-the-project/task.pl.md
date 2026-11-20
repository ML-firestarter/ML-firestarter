---
description: Odczytaj zależności projektu i skryptu z tekstu ich plików.
---

# Przeczytaj projekt

*Korzysta z lekcji [Python na twoim komputerze](../../../../../notes/02-python/04-programs/03-python-on-your-computer.pl.md), z której przydadzą się `pyproject.toml` i nagłówki skryptów, oraz z lekcji [Moduły i biblioteka standardowa](../../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md), z której przydadzą się `re` i `tomllib`.*

`uv` zapisuje zależności projektu w pliku `pyproject.toml`, a zależności pojedynczego skryptu w komentarzu na jego początku. Dokończ cztery funkcje, które je odczytują. Każda dostaje **tekst** pliku, a `re` i `tomllib` są już zaimportowane:

- `package_name(requirement)` zwraca nazwę pakietu z wymagania takiego jak `"numpy>=2.4.6"`, zapisaną małymi literami, bez wersji, bez dodatków w `[ ]` i bez warunków po `;`. Nazwa składa się z liter, cyfr, kropek, podkreślników i myślników, a wokół operatora mogą być spacje, jak w `"Pillow ~= 10.0"`.
- `dependency_names(text)` czyta tekst `pyproject.toml` i zwraca posortowane nazwy pakietów z `dependencies` w `[project]` albo `[]`, gdy ich nie ma.
- `dev_dependencies(text)` robi to samo dla listy `dev` w tabeli `[dependency-groups]`, czyli tam, gdzie pakiety dodaje `uv add --dev`, i zwraca `[]`, gdy tej listy nie ma.
- `script_dependencies(source)` czyta kod skryptu i zwraca `dependencies` z jego nagłówka `# /// script`, w takiej postaci i kolejności, w jakiej je zapisano, albo `[]`, gdy nie ma nagłówka albo zależności. W kodzie jest już `HEADER`, wyrażenie regularne ze standardu, który opisuje takie nagłówki: jego grupa `content` to linijki komentarza między `# /// script` a `# ///`. Gdy zdejmiesz `# ` z początku każdej z nich, zostanie TOML.

| Wywołanie                                              | Zwraca                  |
| ------------------------------------------------------ | ----------------------- |
| `dependency_names` projektu z `numpy>=2.4.6` i `torch` | `['numpy', 'torch']`    |
| `dev_dependencies` projektu z `pytest>=9.1.1` w `dev`  | `['pytest']`            |
| `script_dependencies` skryptu z `numpy` i `rich>=13`   | `['numpy', 'rich>=13']` |

> [!TIP]
> `tomllib.loads(text)` zamienia TOML na słowniki i listy. Tabela `[project]` staje się `data["project"]`, a `[dependency-groups]` staje się `data["dependency-groups"]`. Gdy tabeli może brakować, pomoże `dict.get(key, default)`.
