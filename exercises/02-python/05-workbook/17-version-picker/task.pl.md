---
description: Wybierz najnowszą wersję każdej zależności z pyproject.toml, która pasuje do jej specyfikatora, tak jak robi to uv, i powiedz wyraźnie, gdy żadna nie pasuje.
---

# Wybieracz wersji

*Korzysta z lekcji [Python na twoim komputerze](../../../../notes/02-python/04-programs/03-python-on-your-computer.pl.md) dla `pyproject.toml` i specyfikatorów wersji, [Moduły i biblioteka standardowa](../../../../notes/02-python/04-programs/02-modules-and-the-standard-library.pl.md) dla `tomllib` i `re` oraz [Wyjątki](../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla zgłaszania błędów.*

Gdy uruchamiasz `uv add`, musi wybrać, którą wersję każdej biblioteki zainstalować: najnowszą, która pasuje do tego, o co prosi projekt. Oto ten wybór w małej skali. Kod daje ci `parse_version`, `allows(specifier, version)` z ćwiczenia *Czy pasuje*, wyrażenie regularne `REQUIREMENT`, które dzieli wymaganie takie jak `"numpy >= 2.0,<3"` na nazwę i specyfikator, oraz `AVAILABLE`, słownik od nazwy każdego pakietu do listy jego wersji. Dokończ dwie funkcje:

- `best_version(specifier, versions)` zwraca **najwyższą** wersję z `versions`, która pasuje do specyfikatora, albo `None`, gdy żadna. Wersje porównuje się jako liczby, więc `1.10` jest powyżej `1.9`, a pusty specyfikator pasuje do wszystkich.
- `resolve(text, available)` czyta tekst `pyproject.toml` i zwraca słownik od nazwy każdego pakietu z `dependencies` w `[project]`, małymi literami, do wersji wybranej dla niego z `available[name]`. Projekt bez zależności daje `{}`.

`resolve` odmawia tego, czego nie może, przez `LookupError`, rodzaj błędu dla czegoś, czego nie ma. Komunikat nazywa pakiet: `unknown package: scipy`, gdy `available` go nie ma, i `no version of numpy fits >=4`, gdy żadna z jego wersji nie pasuje, ze specyfikatorem tak, jak go napisano, bez spacji wokół niego.

| Wywołanie                                              | Zwraca                                          |
| ------------------------------------------------------ | ----------------------------------------------- |
| `best_version(">=2.0,<3", ["1.26.4", "2.4.6", "3.0.0"])` | `"2.4.6"`                                       |
| `best_version(">=4", ["2.9.0"])`                       | `None`                                          |
| `resolve` z `["numpy>=2.0,<3", "torch"]` i `AVAILABLE` | `{"numpy": "2.4.6", "torch": "2.14.1"}`         |

Program pod funkcjami wypisuje wybór dla `numpy` i dla całego projektu.

> [!TIP]
> `max(fitting, key=parse_version)` porównuje wersje jako krotki liczb. `REQUIREMENT.fullmatch(requirement).groups()` daje nazwę i specyfikator wymagania, a `.strip()` zdejmuje spacje ze specyfikatora.
