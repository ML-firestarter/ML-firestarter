---
description: Wybierz dla każdej zależności z pyproject.toml najnowszą wersję, która spełnia jej specyfikator, tak jak robi to uv, i zgłoś wyraźny błąd, gdy żadna go nie spełnia.
---

# Wybór wersji

*Korzysta z lekcji [Python na twoim komputerze](../../../../notes/02-python/04-programs/03-python-on-your-computer.pl.md), z której przydadzą się `pyproject.toml` i specyfikatory wersji, z lekcji [Moduły i biblioteka standardowa](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md), z której przydadzą się `tomllib` i `re`, oraz z lekcji [Wyjątki](../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przyda się zgłaszanie błędów.*

Gdy uruchamiasz `uv add`, uv musi wybrać, którą wersję każdej biblioteki zainstalować: najnowszą, która spełnia wymagania projektu. W tym ćwiczeniu zrobisz taki wybór w małej skali. W kodzie są już `parse_version` i `allows(specifier, version)` z ćwiczenia *Czy wersja pasuje?*, wyrażenie regularne `REQUIREMENT`, które dzieli wymaganie takie jak `"numpy >= 2.0,<3"` na nazwę i specyfikator, oraz `AVAILABLE`, słownik, w którym nazwie każdego pakietu odpowiada lista jego wersji. Dokończ dwie funkcje:

- `best_version(specifier, versions)` zwraca **najwyższą** wersję z `versions`, która spełnia specyfikator, albo `None`, gdy żadna go nie spełnia. Wersje porównuje się jak liczby, więc `1.10` jest wyższa niż `1.9`, a pusty specyfikator spełnia każda wersja.
- `resolve(text, available)` czyta tekst `pyproject.toml` i zwraca słownik, w którym nazwie każdego pakietu z `dependencies` w `[project]`, zapisanej małymi literami, odpowiada wersja wybrana dla niego z `available[name]`. Projekt bez zależności daje `{}`.

`resolve` odmawia tego, czego nie może zrobić, zgłaszając `LookupError`, czyli rodzaj błędu oznaczający, że czegoś nie znaleziono. Komunikat podaje nazwę pakietu: `unknown package: scipy`, gdy w `available` nie ma tego pakietu, i `no version of numpy fits >=4`, gdy żadna z jego wersji nie spełnia specyfikatora, przy czym specyfikator jest zapisany tak jak w projekcie, bez otaczających go spacji.

| Wywołanie                                                | Zwraca                                  |
| -------------------------------------------------------- | --------------------------------------- |
| `best_version(">=2.0,<3", ["1.26.4", "2.4.6", "3.0.0"])` | `"2.4.6"`                               |
| `best_version(">=4", ["2.9.0"])`                         | `None`                                  |
| `resolve` z `["numpy>=2.0,<3", "torch"]` i `AVAILABLE`   | `{"numpy": "2.4.6", "torch": "2.14.1"}` |

Program pod funkcjami wypisuje wybór dla `numpy` i dla całego projektu.

> [!TIP]
> `max(fitting, key=parse_version)` porównuje wersje jako krotki liczb. `REQUIREMENT.fullmatch(requirement).groups()` daje nazwę i specyfikator wymagania, a `.strip()` usuwa spacje wokół specyfikatora.
