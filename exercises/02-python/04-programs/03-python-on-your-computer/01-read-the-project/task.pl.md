---
description: Przeczytaj zależności projektu i skryptu z tekstu ich plików.
---

# Przeczytaj projekt

*Korzysta z lekcji [Python na twoim komputerze](../../../../notes/02-python/04-programs/03-python-on-your-computer.pl.md) dla `pyproject.toml` i nagłówków skryptów oraz [Moduły i biblioteka standardowa](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md) dla `re` i `tomllib`.*

`uv` trzyma zależności projektu w pliku `pyproject.toml`, a pojedynczego skryptu w komentarzu na jego początku. Dokończ cztery funkcje, które je czytają. Każda dostaje **tekst** pliku, a kod ma już zaimportowane `re` i `tomllib`:

- `package_name(requirement)` zwraca nazwę pakietu z wymagania takiego jak `"numpy>=2.4.6"`, małymi literami, bez wersji, bez dodatków w `[ ]` i bez warunków po `;`. Nazwa to litery, cyfry, kropki, podkreślniki i myślniki, a wymaganie może mieć spacje wokół operatora, jak `"Pillow ~= 10.0"`.
- `dependency_names(text)` czyta tekst `pyproject.toml` i zwraca posortowane nazwy pakietów z `dependencies` w `[project]`, albo `[]`, gdy ich nie ma.
- `dev_dependencies(text)` robi to samo dla listy o nazwie `dev` w tabeli `[dependency-groups]`, czyli tam, gdzie `uv add --dev` wkłada pakiety, i zwraca `[]`, gdy jej nie ma.
- `script_dependencies(source)` czyta kod skryptu i zwraca `dependencies` z jego nagłówka `# /// script`, tak jak napisano, po kolei, albo `[]`, gdy nie ma nagłówka albo zależności. Kod daje ci `HEADER`, wyrażenie regularne ze standardu, który definiuje te nagłówki: jego grupa `content` to linie komentarza między `# /// script` a `# ///`. Zdjęcie `# ` z początku każdej linii zostawia TOML.

| Wywołanie                                                      | Zwraca                |
| -------------------------------------------------------------- | --------------------- |
| `dependency_names` projektu z `numpy>=2.4.6` i `torch`         | `['numpy', 'torch']`  |
| `dev_dependencies` projektu z `pytest>=9.1.1` w `dev`          | `['pytest']`          |
| `script_dependencies` skryptu z `numpy` i `rich>=13`           | `['numpy', 'rich>=13']` |

> [!TIP]
> `tomllib.loads(text)` zamienia TOML na słowniki i listy. Tabela `[project]` staje się `data["project"]`, a `[dependency-groups]` staje się `data["dependency-groups"]`. `dict.get(key, default)` pomaga, gdy tabeli może brakować.
