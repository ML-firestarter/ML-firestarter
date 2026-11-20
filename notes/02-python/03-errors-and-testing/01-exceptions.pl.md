---
description: Łap błędy przez try i except, zgłaszaj własne i czytaj ślad stosu, pisząc program do czytania paragonów, który nie zatrzymuje się na pierwszej złej linijce.
---

# Wyjątki

Kasa w sklepie drukuje paragon z jedną pozycją w każdej linijce, a ceny są wpisywane ręcznie, więc niektóre linijki są błędne: litera tam, gdzie powinna być liczba, brak ceny, pusta linijka. Program, który sumuje paragon, nie powinien się poddawać przy pierwszej z nich. Powinien zsumować poprawne linijki i powiedzieć, które były błędne i dlaczego.

W ćwiczeniach do tej lekcji napiszesz program do czytania paragonów i funkcję, która czyta ślad stosu. Będą ci potrzebne:

- **wyjątki**, czyli to, co Python zgłasza, gdy nie może kontynuować,
- **`try` i `except`**, które je łapią,
- **`else` i `finally`**, które mówią, co dzieje się dalej,
- **`raise`**, z komunikatami, które mówią, co jest nie tak,
- **ślady stosu** (ang. traceback), które mówią, gdzie coś poszło nie tak.

## Czym jest wyjątek

Gdy Python nie może wykonać linijki, **zgłasza wyjątek**, czyli obiekt, który mówi, co poszło nie tak. Jeśli nic go nie obsłuży, program się zatrzymuje, a Python wypisuje **ślad stosu**. Najczęściej spotkasz te rodzaje wyjątków:

| Wyjątek             | Kiedy występuje                                      |
| ------------------- | ---------------------------------------------------- |
| `ValueError`        | wartość właściwego typu, ale niewłaściwa: `int("x")` |
| `TypeError`         | wartość niewłaściwego typu: `"a" + 1`                |
| `ZeroDivisionError` | dzielenie przez zero                                 |
| `IndexError`        | indeks poza końcem listy                             |
| `KeyError`          | klucz, którego nie ma w słowniku                     |
| `FileNotFoundError` | otwarcie pliku, którego nie ma                       |

Oto wszystkie, złapane jeden po drugim. `lambda:` tworzy malutką funkcję bez nazwy, żeby pętla mogła po kolei wypróbować każdą linijkę kodu:

```python run
actions = [
    lambda: 10 / 0,
    lambda: int("x"),
    lambda: [1, 2][5],
    lambda: {"a": 1}["b"],
    lambda: "a" + 1,
    lambda: open("nothing.txt"),
]

for action in actions:
    try:
        action()
    except Exception as error:
        print(type(error).__name__, "-", error)
```

## Czytanie śladu stosu

Ślad stosu wymienia wywołania, które doprowadziły do błędu, i kończy się samym błędem. Tutaj funkcja dostaje pustą listę:

```python run
def average(numbers):
    total = sum(numbers)
    return total / len(numbers)


print(average([2, 4, 9]))
print(average([]))
```

Pierwsze wywołanie działa i wypisuje `5.0`, a drugie zatrzymuje program ze śladem stosu takim jak ten:

```text
Traceback (most recent call last):
  File "main.py", line 7, in <module>
    print(average([]))
          ~~~~~~~^^^^
  File "main.py", line 3, in average
    return total / len(numbers)
           ~~~~~~^~~~~~~~~~~~~~
ZeroDivisionError: division by zero
```

Czyta się go od dołu:

1. **Ostatnia linijka** to błąd: jego rodzaj, dwukropek i komunikat. Tutaj `ZeroDivisionError: division by zero`.
2. **Linijka `File` nad nią** mówi, gdzie błąd wystąpił: w linijce 3, w funkcji `average`, a pod spodem jest kod tej linijki. Właśnie na nią warto spojrzeć najpierw.
3. **Linijki `File` wyżej** to wywołania, które tam doprowadziły, od najbardziej zewnętrznego. Linijka 7, w `<module>`, to sam program, poza jakąkolwiek funkcją, i to on wywołał `average`. Znaczki `~~~^^^` wskazują część linijki, która zawiodła.

Błąd jest w `average`, a jego przyczyna w tym, z czym ją wywołano, czyli w pustej liście. Ślad stosu mówi, gdzie program się zatrzymał, a poprawka może być gdzieś wyżej.

## try i except

`try` uruchamia kod, a jeśli ten zgłosi wyjątek, zamiast zatrzymania programu uruchamia się `except`:

```python run
text = "twenty"

try:
    age = int(text)
    print("Age:", age)
except ValueError:
    print("That's not a number")

print("The program goes on")
```

Kod w `try` zatrzymuje się na linijce, która zgłasza wyjątek, a reszta `try` zostaje pominięta. Po `except` program działa dalej. Wyjątek innego rodzaju nie zostaje złapany i nadal zatrzymuje program, i o to właśnie chodzi: `except ValueError` obsługuje tylko to, do czego go napisano.

`as` daje dostęp do samego wyjątku. `str(error)` to jego komunikat, a `type(error).__name__` jego rodzaj. Po jednym `try` może być kilka bloków `except`, a jeden blok może obsługiwać kilka rodzajów naraz, podanych w nawiasach:

```python run
def read_age(text):
    try:
        age = int(text)
        return 100 // age
    except ValueError as error:
        return f"bad number ({error})"
    except (ZeroDivisionError, OverflowError):
        return "age can't be 0"


print(read_age("20"))
print(read_age("twenty"))
print(read_age("0"))
```

> [!WARNING]
> `except:` bez niczego dalej albo `except Exception:` wokół dużego kawałka kodu łapie też błędy, o których nie wiesz, na przykład literówkę w nazwie, i je ukrywa. Łap te rodzaje błędów, których się spodziewasz, i tylko wokół linijek, które mogą je zgłosić.

## else i finally

`else` uruchamia się, gdy `try` niczego nie zgłosiło, i jest miejscem na to, co ma sens tylko po sukcesie. `finally` uruchamia się zawsze, także po błędzie, więc tam trafia sprzątanie:

```python run
def to_cents(text):
    try:
        price = float(text)
    except ValueError:
        print("bad price:", text)
        return None
    else:
        print("good price:", text)
        return round(price * 100)
    finally:
        print("done with", text)


print(to_cents("3.50"))
print(to_cents("x"))
```

`finally` uruchamia się, choć obie gałęzie wykonują `return`. Jeśli w `try` zostawić tylko linijkę, która może zawieść, a resztę przenieść do `else`, `except` nie złapie przypadkiem błędu z kodu, który po niej następuje.

## Zgłaszanie własnych wyjątków

`raise` zatrzymuje funkcję wyjątkiem wybranym przez ciebie, a jego komunikat zobaczy osoba czytająca ślad stosu albo `str(error)` w kodzie, który wywołał funkcję. Funkcja, która dostała coś, z czym nie może pracować, powinna powiedzieć, co jest nie tak i co dostała:

```python run
def parse_price(text):
    if text == "":
        raise ValueError("empty price")
    try:
        return float(text)
    except ValueError:
        raise ValueError(f"bad price: {text}")


for text in ["3.50", "", "x"]:
    try:
        print(parse_price(text))
    except ValueError as error:
        print("problem:", error)
```

Zgłoszenie `ValueError` z wnętrza `except` zastępuje komunikat Pythona o liczbach zmiennoprzecinkowych komunikatem, który pasuje do twojego programu. Samo `raise`, bez niczego dalej, użyte wewnątrz `except` przekazuje dalej właśnie złapany błąd, kiedy chcesz coś zapisać w logu, a mimo to zatrzymać program. Własny rodzaj błędu to klasa wywodząca się z `Exception`, a takie klasy pisze się w lekcji [Klasy](../04-programs/01-classes.pl.md).

## Nie zatrzymywać się na pierwszym błędzie

Pętla, która sama obsługuje błąd każdego elementu, może przejść przez całą listę i zebrać wszystko, co poszło nie tak. Tak wygląda szkielet programu do czytania paragonów:

```python run
def parse_price(text):
    try:
        return float(text)
    except ValueError:
        raise ValueError(f"bad price: {text}")


prices = ["3.50", "x", "2.40", ""]
total = 0
problems = []

for number, text in enumerate(prices, start=1):
    try:
        total += parse_price(text)
    except ValueError as error:
        problems.append([number, str(error)])

print(total)
print(problems)
```

`enumerate()` numeruje elementy listy w trakcie przechodzenia przez nią, zaczynając od `start`. Suma zawiera tylko poprawne ceny, a `problems` mówi, które pozycje były błędne, podając ich numery, i dlaczego.

## Twoja kolej

W ćwiczeniu [Przeczytaj paragon](../../../exercises/02-python/03-errors-and-testing/01-exceptions/01-read-the-receipt/task.pl.md) przetworzysz linijki paragonu, zgłaszając błąd dla każdego rodzaju pomyłki, i zsumujesz poprawne linijki, zbierając błędne. W ćwiczeniu [Przeczytaj ślad stosu](../../../exercises/02-python/03-errors-and-testing/01-exceptions/02-read-the-traceback/task.pl.md) wyciągniesz z tekstu śladu stosu rodzaj błędu, funkcję i linijkę.
