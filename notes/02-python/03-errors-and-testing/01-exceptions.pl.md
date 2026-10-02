---
description: Łap błędy przez try i except, zgłaszaj własne i czytaj ślad stosu, do czytnika paragonów, który nie zatrzymuje się na pierwszej złej linii.
---

# Wyjątki

Kasa sklepu drukuje paragon z jedną pozycją w każdej linii, a ceny wpisuje się ręcznie, więc niektóre linie są błędne: litera tam, gdzie ma być liczba, brakująca cena, pusta linia. Program, który sumuje paragon, nie powinien poddawać się na pierwszej z nich. Powinien zsumować dobre linie i powiedzieć, które były złe i dlaczego.

W ćwiczeniach do tej lekcji napiszesz czytnik paragonów i funkcję, która czyta ślad stosu. Potrzebujesz do tego:

- **wyjątków**, czyli tego, co Python zgłasza, gdy nie może iść dalej,
- **`try` i `except`**, które je łapią,
- **`else` i `finally`**, które mówią, co dzieje się dalej,
- **`raise`**, z komunikatami, które mówią, co jest nie tak,
- **śladów stosu**, które mówią, gdzie poszło nie tak.

## Czym jest wyjątek

Gdy Python nie może pójść dalej z linią, **zgłasza wyjątek**, obiekt, który mówi, co poszło nie tak. Jeśli nic go nie obsłuży, program się zatrzymuje, a Python wypisuje **ślad stosu** (ang. traceback). Rodzaje, które spotkasz najczęściej:

| Wyjątek             | Kiedy się zdarza                                        |
| ------------------- | ------------------------------------------------------- |
| `ValueError`        | dobry typ wartości, ale zła wartość: `int("x")`         |
| `TypeError`         | zły typ wartości: `"a" + 1`                             |
| `ZeroDivisionError` | dzielenie przez zero                                    |
| `IndexError`        | indeks za końcem listy                                  |
| `KeyError`          | klucz, którego nie ma w słowniku                        |
| `FileNotFoundError` | otwarcie pliku, którego nie ma                          |

Oto wszystkie, złapane po jednym. `lambda:` tworzy malutką funkcję bez nazwy, żeby pętla mogła wypróbować po kolei każdą linię kodu:

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

Ślad stosu wypisuje wywołania, które doprowadziły do błędu, i kończy się błędem. Tutaj funkcja dostaje pustą listę:

```python run
def average(numbers):
    total = sum(numbers)
    return total / len(numbers)


print(average([2, 4, 9]))
print(average([]))
```

Pierwsze wywołanie działa i wypisuje 5.0, a drugie zatrzymuje program śladem stosu takim jak ten:

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

Czytaj go od dołu:

1. **Ostatnia linia** to błąd: jego rodzaj, dwukropek i komunikat. Tutaj `ZeroDivisionError: division by zero`.
2. **Linia `File` nad nią** to miejsce, gdzie się zdarzyło: linia 3, w funkcji `average`, z kodem tej linii pod spodem. Na tę linię patrz najpierw.
3. **Linie `File` wyżej** to wywołania, które tam doprowadziły, najbardziej zewnętrzne pierwsze. Linia 7, w `<module>`, to sam program, poza jakąkolwiek funkcją, i to on wywołał `average`. Znaki `~~~^^^` wskazują część linii, która zawiodła.

Błąd jest w `average`, a przyczyna w tym, z czym ją wywołano, czyli z pustą listą. Ślad stosu mówi, gdzie program się zatrzymał, a poprawka może być gdzieś wyżej.

## try i except

`try` uruchamia kod, a jeśli zgłosi wyjątek, zamiast zatrzymać program, działa `except`:

```python run
text = "twenty"

try:
    age = int(text)
    print("Age:", age)
except ValueError:
    print("That's not a number")

print("The program goes on")
```

Kod w `try` zatrzymuje się na linii, która zgłasza, a reszta `try` jest pomijana. Po `except` program idzie dalej. Wyjątek innego rodzaju nie jest łapany i nadal zatrzymuje program, a to właśnie jest to, czego chcesz: `except ValueError` obsługuje tylko to, do czego jest napisane.

`as` daje ci sam wyjątek. `str(error)` to jego komunikat, a `type(error).__name__` jego rodzaj. Po jednym `try` może iść kilka bloków `except`, a jeden blok może brać kilka rodzajów, w nawiasach:

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
> `except:` bez niczego po nim albo `except Exception:` wokół dużej ilości kodu łapie błędy, o których nie wiedziałeś, jak literówka w nazwie, i je ukrywa. Łap rodzaje błędów, których się spodziewasz, wokół linii, które mogą je zgłosić.

## else i finally

`else` działa, gdy `try` niczego nie zgłosiło, i jest miejscem na to, co ma sens dopiero po sukcesie. `finally` działa niezależnie od tego, co się stało, także po błędzie, i tam idzie sprzątanie:

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

`finally` działa, chociaż obie gałęzie robią `return`. Trzymanie `try` krótkiego, tylko linii, która może zawieść, a reszty w `else`, sprawia, że `except` nie złapie przypadkiem błędu z kodu po nim.

## Zgłaszanie własnych

`raise` zatrzymuje funkcję wyjątkiem twojego wyboru, a komunikat to to, co widzi czytelnik śladu stosu albo `str(error)` wywołującego. Funkcja, która dostanie coś, z czym nie może nic zrobić, powinna powiedzieć, co jest nie tak i co dostała:

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

Zgłoszenie `ValueError` z wnętrza `except` zastępuje własny komunikat Pythona o liczbach zmiennoprzecinkowych takim, który pasuje do twojego programu. `raise` bez niczego po nim, wewnątrz `except`, przekazuje dalej błąd, który właśnie złapałeś, jeśli chcesz coś zapisać i mimo to się zatrzymać. Własny rodzaj błędu to klasa pochodząca od `Exception`, a [lekcja o klasach](../04-programs/01-classes.pl.md) to miejsce, gdzie się takie pisze.

## Nie zatrzymywać się na pierwszym błędzie

Pętla, która sama obsługuje błąd każdego elementu, może przejść całą listę i zebrać to, co poszło źle. Taki kształt ma czytnik paragonów:

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

`enumerate()` liczy elementy listy, idąc po nich, od `start`. Suma ma tylko dobre ceny, a `problems` mówi, które elementy były złe, przez ich numer, i dlaczego.

## Twoja kolej

W ćwiczeniu [Przeczytaj paragon](../../../exercises/02-python/03-errors-and-testing/01-exceptions/01-read-the-receipt/task.pl.md) sparsujesz linie paragonu, zgłaszając błąd dla każdego rodzaju pomyłki, i zsumujesz dobre, zbierając złe. W ćwiczeniu [Przeczytaj ślad stosu](../../../exercises/02-python/03-errors-and-testing/01-exceptions/02-read-the-traceback/task.pl.md) wyciągniesz z tekstu śladu stosu rodzaj błędu, funkcję i linię.
