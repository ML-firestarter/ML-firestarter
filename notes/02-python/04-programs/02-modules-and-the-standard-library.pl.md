---
description: Importuj moduły i używaj biblioteki standardowej, z re, datetime, Counter i json, żeby przeczytać log serwera internetowego.
---

# Moduły i biblioteka standardowa

Serwer internetowy zapisuje w logu linię dla każdego żądania. Linie mówią, kiedy przyszło, o co poproszono i jak poszło, a nikt nie chce czytać tysięcy z nich: program powinien powiedzieć, ile ich było, która godzina była najbardziej ruchliwa i która strona była najwolniejsza. Do tego potrzeba kilku narzędzi, które Python już ma, a ta lekcja jest o tym, jak je znaleźć.

W ćwiczeniu do tej lekcji napiszesz czytnik logu. Potrzebujesz do tego:

- **`import`**, który sprowadza moduł,
- `re`, żeby wyciągać kawałki z linii tekstu,
- `datetime`, do pracy z datami i czasami,
- `Counter`, do liczenia,
- `json`, żeby zamienić wynik na tekst, który przeczyta inny program,
- `if __name__ == "__main__"`, które oddziela to, co plik definiuje, od tego, co uruchamia.

## Moduły

**Moduł** to plik z kodem Pythona, z którego mogą korzystać inni. `import` udostępnia go, a jego nazw używa się po kropce, jak `math.sqrt`:

```python run
import math

print(math.sqrt(16))
print(math.pi)
print(math.floor(7.9))
```

`from` bierze z modułu kilka nazw, żeby można ich używać osobno, a `as` nadaje modułowi albo nazwie krótszą:

```python run
from math import sqrt, ceil
import statistics as stats

print(sqrt(25))
print(ceil(7.1))
print(stats.mean([2, 4, 9]))
```

Python ma duży zestaw modułów, czyli **bibliotekę standardową**, i nie trzeba niczego instalować: `math`, `random`, `json`, `re`, `datetime`, `collections`, `statistics` i wiele innych. Bibliotek z [rozdziału o PyTorchu](../05-pytorch/README.pl.md), jak `torch` i `numpy`, w niej nie ma. Instaluje się je osobno, a [następna lekcja](03-python-on-your-computer.pl.md) mówi jak. Moduł, który nie istnieje albo nie jest zainstalowany, zatrzymuje program z `ModuleNotFoundError`:

```python run
import tensorflow
```

`dir()` wypisuje nazwy w module, a `help()` pokazuje, co robi jedna z nich:

```python run
import math

print([name for name in dir(math) if name.startswith("c")])
help(math.ceil)
```

## Liczenie z Counter

Liczenie, ile razy pojawia się każdy element, to jedna z najczęstszych prac. [Słownik to potrafi](../01-basics/02-loops-and-dictionaries.pl.md), a `Counter` z `collections` to słownik stworzony do tego. Bierze wszystko, po czym można iść pętlą, a `most_common()` wypisuje elementy od najczęstszego:

```python run
from collections import Counter

statuses = [200, 200, 404, 200, 500, 404]
counts = Counter(statuses)
print(counts)
print(counts[200])
print(counts[301])
print(counts.most_common(2))
```

Element, którego nigdy nie policzono, ma liczbę 0, a nie `KeyError`. Gdy dwa elementy mają tę samą liczbę, `most_common()` zachowuje ten, który przyszedł pierwszy.

## Daty i czasy

`datetime` robi daty i czasy, które Python potrafi porównywać i na których potrafi liczyć. `datetime.strptime()` czyta tekst w formacie, gdzie `%Y` to rok, `%m` miesiąc, `%d` dzień, `%H` godzina, `%M` minuta, a `%S` sekunda, a `strftime()` zapisuje go z powrotem:

```python run
from datetime import datetime, timedelta

moment = datetime.strptime("2024-03-05 09:12:44", "%Y-%m-%d %H:%M:%S")
print(moment)
print(moment.hour, moment.minute)
print(moment + timedelta(hours=2, minutes=30))
print(moment.strftime("%d.%m.%Y"))
```

`timedelta` to odcinek czasu, który można dodać do datetime albo dostać z odjęcia dwóch. Czas, który nie może istnieć, jak 25:99:99, zgłasza `ValueError`, który może złapać `try`, a uszkodzone linie w ćwiczeniu potrzebują właśnie tego:

```python run
from datetime import datetime

try:
    datetime.strptime("2024-03-05 25:99:99", "%Y-%m-%d %H:%M:%S")
except ValueError:
    print("not a time")
```

## Wzorce z re

Tekst taki jak `2024-03-05 09:12:44 GET /home 200 35ms` ma kształt, a moduł `re` opisuje kształty **wyrażeniami regularnymi**. Kilka symboli:

| Wzorzec | Pasuje do                               |
| ------- | --------------------------------------- |
| `\d`    | cyfry                                   |
| `\S`    | dowolnego znaku, który nie jest spacją  |
| `+`     | jednego lub więcej tego, co przed nim   |
| `(...)` | grupy, którą oddaje `groups()`          |
| `a\|b`  | `a` albo `b`                            |

`re.fullmatch()` sprawdza, czy cały tekst pasuje do wzorca. Zwraca `None`, gdy nie, a dopasowanie, gdy tak, którego `groups()` to kawałki w nawiasach. Postaw `r` przed cudzysłowem wzorca, jak w `r"\d+"`, żeby Python zostawił ukośniki w spokoju:

```python run
import re

line = "2024-03-05 09:12:44 GET /home 200 35ms"
match = re.fullmatch(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms", line)
print(match.groups())

print(re.fullmatch(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms", "not a log line"))
```

`\d{3}` znaczy dokładnie 3 cyfry, a tekst `35ms` jest tak pocięty, że liczba jest grupą, a `ms` nie. Kawałki to same teksty: zamieniaj je na liczby przez `int()`.

> [!NOTE]
> `re.search()` szuka wzorca gdziekolwiek w tekście, a `re.findall()` daje każde dopasowanie, ale wzorzec, który ma pasować do całej linii, jest bezpieczniejszy z `fullmatch()`: nie przyjmie linii, która tylko zaczyna się od czegoś dobrego.

## Tekst, który program przeczyta, z json

`json` zamienia słowniki i listy na tekst i z powrotem. Tak programy przekazują sobie dane i tak trzyma je wiele API i plików. `dumps()` robi tekst, a `loads()` go czyta. Z `sort_keys=True` klucze wychodzą po kolei, więc te same dane zawsze dają ten sam tekst:

```python run
import json

summary = {"requests": 16, "slowest": "/exercises", "errors": 2}
text = json.dumps(summary, sort_keys=True)
print(text)
print(json.loads(text)["requests"])
```

JSON zachowuje liczby, tekst, `True` i `False` (zapisywane `true` i `false`), `None` (zapisywane `null`), listy i słowniki. `datetime` nie ma wśród nich, więc program zamienia go na tekst przez `strftime()`, zanim trafi do środka.

## Własne moduły

Własny plik też jest modułem: `import helpers` uruchamia `helpers.py` i sprowadza jego nazwy. Plik może sprawdzić, czy jest uruchamiany, czy importowany, patrząc na zmienną `__name__`, która wynosi `"__main__"` tylko wtedy, gdy plik uruchamia się samodzielnie:

```python run
print(__name__)

if __name__ == "__main__":
    print("run on its own")
```

Dlatego ćwiczenia mają te linie na dole: to, co jest pod `if __name__ == "__main__":`, działa, gdy naciśniesz **Uruchom**, i jest pomijane, gdy testy importują plik, żeby wywołać jego funkcje.

## Twoja kolej

W ćwiczeniu [Raport z logu](../../../exercises/02-python/04-programs/02-modules-and-the-standard-library/01-log-report/task.pl.md) przeczytasz log serwera internetowego: rozbierzesz każdą linię przez `re`, zamienisz jej czas na `datetime`, znajdziesz najbardziej ruchliwą godzinę przez `Counter` i zapiszesz podsumowanie jako `json`. Uważaj na uszkodzone linie w pliku.
