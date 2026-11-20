---
description: Importuj moduły i korzystaj z biblioteki standardowej, z re, datetime, Counter i json, żeby przeczytać log serwera internetowego.
---

# Moduły i biblioteka standardowa

Serwer internetowy zapisuje w logu linijkę dla każdego żądania. Linijki mówią, kiedy przyszło żądanie, o co prosiło i jak się zakończyło, a nikt nie chce czytać ich tysięcy: program powinien powiedzieć, ile ich było, która godzina była najbardziej ruchliwa i która strona odpowiadała najwolniej. Do tego wystarczy kilka narzędzi, które Python już ma, a ta lekcja pokazuje, jak je znaleźć.

W ćwiczeniu do tej lekcji napiszesz program do czytania logów. Będą ci potrzebne:

- **`import`**, który wczytuje moduł,
- `re`, do wyciągania kawałków z linijki tekstu,
- `datetime`, do pracy z datami i godzinami,
- `Counter`, do liczenia,
- `json`, do zamieniania wyniku na tekst, który odczyta inny program,
- `if __name__ == "__main__"`, które oddziela to, co plik definiuje, od tego, co uruchamia.

## Moduły

**Moduł** to plik z kodem w Pythonie, z którego mogą korzystać inne programy. `import` udostępnia moduł, a jego nazw używa się po kropce, na przykład `math.sqrt`:

```python run
import math

print(math.sqrt(16))
print(math.pi)
print(math.floor(7.9))
```

`from` wyjmuje z modułu kilka nazw, żeby można ich było używać bezpośrednio, a `as` nadaje modułowi albo nazwie krótszą nazwę:

```python run
from math import sqrt, ceil
import statistics as stats

print(sqrt(25))
print(ceil(7.1))
print(stats.mean([2, 4, 9]))
```

Python ma duży zestaw modułów, **bibliotekę standardową**, której nie trzeba instalować: `math`, `random`, `json`, `re`, `datetime`, `collections`, `statistics` i wiele innych. Biblioteki z [rozdziału o PyTorchu](../../05-pytorch/README.pl.md), takie jak `torch` i `numpy`, do niej nie należą. Instaluje się je osobno, a jak, mówi [następna lekcja](03-python-on-your-computer.pl.md). Moduł, którego nie ma albo który nie jest zainstalowany, zatrzymuje program błędem `ModuleNotFoundError`:

```python run
import tensorflow
```

`dir()` wymienia nazwy w module, a `help()` pokazuje, co robi jedna z nich:

```python run
import math

print([name for name in dir(math) if name.startswith("c")])
help(math.ceil)
```

## Liczenie z Counter

Liczenie, ile razy pojawia się każdy element, to jedno z najczęstszych zadań. [Może to zrobić słownik](../01-basics/02-loops-and-dictionaries.pl.md), a `Counter` z modułu `collections` to słownik stworzony właśnie do tego. Przyjmuje wszystko, po czym można przejść pętlą, a `most_common()` wymienia elementy od najczęstszego:

```python run
from collections import Counter

statuses = [200, 200, 404, 200, 500, 404]
counts = Counter(statuses)
print(counts)
print(counts[200])
print(counts[301])
print(counts.most_common(2))
```

Element, którego nigdy nie liczono, ma licznik 0, zamiast zgłaszać `KeyError`. Gdy dwa elementy mają ten sam licznik, `most_common()` stawia wyżej ten, który pojawił się pierwszy.

## Daty i godziny

`datetime` tworzy daty i godziny, które Python potrafi porównywać i na których potrafi liczyć. `datetime.strptime()` czyta tekst w podanym formacie, gdzie `%Y` to rok, `%m` miesiąc, `%d` dzień, `%H` godzina, `%M` minuta, a `%S` sekunda, a `strftime()` zapisuje datę z powrotem jako tekst:

```python run
from datetime import datetime, timedelta

moment = datetime.strptime("2024-03-05 09:12:44", "%Y-%m-%d %H:%M:%S")
print(moment)
print(moment.hour, moment.minute)
print(moment + timedelta(hours=2, minutes=30))
print(moment.strftime("%d.%m.%Y"))
```

`timedelta` to odcinek czasu, który można dodać do daty z godziną albo dostać, odejmując od siebie dwie takie daty. Godzina, która nie może istnieć, na przykład 25:99:99, zgłasza `ValueError`, który można złapać przez `try`, a właśnie tego wymagają uszkodzone linijki w ćwiczeniu:

```python run
from datetime import datetime

try:
    datetime.strptime("2024-03-05 25:99:99", "%Y-%m-%d %H:%M:%S")
except ValueError:
    print("not a time")
```

## Wzorce z re

Tekst taki jak `2024-03-05 09:12:44 GET /home 200 35ms` ma określony kształt, a moduł `re` opisuje kształty za pomocą **wyrażeń regularnych**. Kilka symboli:

| Wzorzec | Pasuje do                                            |
| ------- | ---------------------------------------------------- |
| `\d`    | cyfry                                                |
| `\S`    | dowolnego znaku, który nie jest spacją               |
| `+`     | jednego lub więcej powtórzeń tego, co stoi przed nim |
| `(...)` | grupy, którą zwraca `groups()`                       |
| `a\|b`  | `a` albo `b`                                         |

`re.fullmatch()` sprawdza, czy cały tekst pasuje do wzorca. Zwraca `None`, gdy nie pasuje, a gdy pasuje, zwraca dopasowanie, którego `groups()` daje kawałki z nawiasów. Przed cudzysłowem wzorca postaw `r`, jak w `r"\d+"`, żeby Python zostawił ukośniki wsteczne w spokoju:

```python run
import re

line = "2024-03-05 09:12:44 GET /home 200 35ms"
match = re.fullmatch(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms", line)
print(match.groups())

print(re.fullmatch(r"(\S+ \S+) (GET|POST) (\S+) (\d{3}) (\d+)ms", "not a log line"))
```

`\d{3}` oznacza dokładnie 3 cyfry, a tekst `35ms` jest pocięty tak, że liczba jest grupą, a `ms` nie. Wszystkie kawałki są tekstem: zamień je na liczby przez `int()`.

> [!NOTE]
> `re.search()` szuka wzorca w dowolnym miejscu tekstu, a `re.findall()` zwraca wszystkie dopasowania, ale wzorzec, który ma pasować do całej linijki, bezpieczniej sprawdzać przez `fullmatch()`: nie zaakceptuje linijki, która tylko zaczyna się od czegoś poprawnego.

## Tekst dla innych programów: json

`json` zamienia słowniki i listy na tekst i z powrotem. Tak programy przekazują sobie dane i tak przechowuje je wiele interfejsów API i plików. `dumps()` tworzy tekst, a `loads()` go czyta. Z `sort_keys=True` klucze wychodzą posortowane, więc te same dane zawsze dają ten sam tekst:

```python run
import json

summary = {"requests": 16, "slowest": "/exercises", "errors": 2}
text = json.dumps(summary, sort_keys=True)
print(text)
print(json.loads(text)["requests"])
```

JSON przechowuje liczby, tekst, `True` i `False` (zapisywane jako `true` i `false`), `None` (zapisywane jako `null`), listy i słowniki. Nie ma wśród nich `datetime`, więc program zamienia datę na tekst przez `strftime()`, zanim ją zapisze.

## Własne moduły

Twój własny plik też jest modułem: `import helpers` uruchamia `helpers.py` i wczytuje jego nazwy. Plik może sprawdzić, czy jest uruchamiany, czy importowany, patrząc na zmienną `__name__`, która wynosi `"__main__"` tylko wtedy, gdy plik uruchomiono samodzielnie:

```python run
print(__name__)

if __name__ == "__main__":
    print("run on its own")
```

Dlatego ćwiczenia mają na dole te linijki: to, co jest pod `if __name__ == "__main__":`, uruchamia się po naciśnięciu **Uruchom** i jest pomijane, gdy sprawdzenia importują plik, żeby wywoływać jego funkcje.

## Twoja kolej

W ćwiczeniu [Raport z logu](../../../exercises/02-python/04-programs/02-modules-and-the-standard-library/01-log-report/task.pl.md) przeczytasz log serwera internetowego: rozłożysz każdą linijkę na części przez `re`, zamienisz jej godzinę na `datetime`, znajdziesz najbardziej ruchliwą godzinę przez `Counter` i zapiszesz podsumowanie jako `json`. Uważaj na uszkodzone linijki w pliku.
