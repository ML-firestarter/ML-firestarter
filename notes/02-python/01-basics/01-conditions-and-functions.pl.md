---
description: Zmienne, wczytywanie danych, porównania, if i funkcje, do programu, który sprawdza, czy ktoś jest pełnoletni.
---

# Warunki i funkcje

Na końcu tej lekcji napiszesz program, który pyta o wiek i mówi, czy to już pełnoletność. To mały program, ale potrzebuje czterech rzeczy, z których korzysta niemal każdy program:

- **zmiennych**, które przechowują wartości pod nazwą,
- **wczytywania**, które odczytuje to, co wpisuje użytkownik,
- **warunków**, które w różnych przypadkach uruchamiają różny kod,
- **funkcji**, które nadają kawałkowi kodu nazwę, żeby można go było użyć ponownie.

> [!TIP]
> Każdy przykład w tej lekcji działa w twojej przeglądarce. Naciśnij **Uruchom**, żeby go uruchomić, **Edytuj**, żeby go zmienić, a **Cofnij zmiany**, żeby wrócić do wersji z lekcji. Wypróbowywanie to najszybszy sposób nauki.

## Zmienne

**Zmienna** to nazwa wartości. `=` nadaje nazwie wartość i od tej chwili nazwa oznacza tę wartość:

```python run
age = 20
print(age)
print(age + 1)
```

`=` nie mówi, że dwie rzeczy są równe, jak w matematyce. To polecenie: „niech `age` wynosi 20”. Zmienna może później dostać nową wartość i wtedy nazwa oznacza już tę nową:

```python run
age = 20
age = age + 1
print(age)
```

Drugi wiersz oblicza `age + 1`, czyli 21, i robi z tego nową wartość `age`.

Nazwa zmiennej może zawierać litery, cyfry i `_`, ale nie może zaczynać się od cyfry. Python odróżnia wielkie litery od małych, więc `age` i `Age` to dwie różne zmienne. Nazwy z kilku słów pisze się małymi literami, z `_` między słowami, na przykład `user_age`. W tym kursie zmienne mają angielskie nazwy, jak w większości kodu na świecie.

## Wczytywanie tego, co wpisuje użytkownik

`input()` czeka, aż użytkownik wpisze wiersz, i zwraca ten wiersz. Wpisz swój wiek w polu **Wejście** pod przykładem i naciśnij **Uruchom**:

```python run
age = input()
print("Wpisano", age)
```

To, co zwraca `input()`, jest zawsze tekstem, nawet gdy składa się z cyfr: `"20"`, a nie `20`. Tekst i liczby to różne rodzaje wartości, czyli **typy**. Python nazywa tekst `str`, od ang. string, czyli **napis**, a liczby całkowite `int`, od ang. integer. `type()` pokazuje, który to typ:

```python run
print(type("20"))
print(type(20))
```

`int()` zamienia tekst z cyfr na liczbę:

```python run
text = "20"
number = int(text)
print(number + 1)
```

Dlatego program, który wczytuje liczbę, zwykle wczytuje ją i zamienia w jednym wierszu: `age = int(input())`. Bez `int()` liczba zostaje tekstem, a tekst nie łączy się z liczbami. Python zatrzymuje się wtedy z błędem `TypeError`, błędem typu:

```python run
age = "20"
print(age + 1)
```

`int()` z tekstu, który nie jest liczbą całkowitą, na przykład `int("dwadzieścia")`, kończy się za to błędem `ValueError`, błędem wartości.

## Porównania

Porównanie sprawdza, czy coś jest prawdą, i daje `True` (prawda) albo `False` (fałsz):

```python run
age = 20
print(age >= 18)
print(age == 17)
```

| Operator | Znaczenie            | Przykład   | Wynik   |
| -------- | -------------------- | ---------- | ------- |
| `==`     | równe                | `5 == 5`   | `True`  |
| `!=`     | różne                | `5 != 5`   | `False` |
| `<`      | mniejsze             | `3 < 5`    | `True`  |
| `<=`     | mniejsze lub równe   | `5 <= 5`   | `True`  |
| `>`      | większe              | `3 > 5`    | `False` |
| `>=`     | większe lub równe    | `18 >= 18` | `True`  |

`True` i `False` to wartości osobnego typu, `bool`, czyli **wartości logiczne**. Uważaj na różnicę między `=` a `==`: `age = 18` ustawia `age` na 18, a `age == 18` pyta, czy tyle wynosi.

Tekst można porównać z tekstem, `"tak" == "tak"` daje `True`, ale tekstu nie da się porównać z liczbą. Ten właśnie błąd czeka na ciebie w ćwiczeniu do tej lekcji:

```python run
print("20" >= 18)
```

`and` (i), `or` (lub) i `not` (nie) łączą porównania:

- `a and b` daje `True`, gdy prawdą jest i `a`, i `b`,
- `a or b` daje `True`, gdy prawdą jest przynajmniej jedno z nich,
- `not a` daje `True`, gdy `a` to `False`, i na odwrót.

```python run
age = 30
print(age >= 18 and age < 65)
print(age < 18 or age >= 65)
print(not age >= 18)
```

## Decyzje z if

`if` (jeśli) uruchamia blok kodu tylko wtedy, gdy warunek daje `True`:

```python run
age = 20
if age >= 18:
    print("Możesz głosować.")
print("Gotowe.")
```

Wiersz z `if` kończy się dwukropkiem, a wiersze, które do niego należą, są pod nim wcięte o cztery spacje. Tak Python wie, gdzie blok się kończy: `print("Gotowe.")` nie jest wcięte, więc wykona się tak czy inaczej. Zmień `age` na 15 i uruchom przykład ponownie.

`else` (w przeciwnym razie) dodaje blok, który wykonuje się, gdy warunek daje `False`, a `elif`, skrót od „else if”, sprawdza kolejny warunek, gdy wcześniejsze dały `False`:

```python run
age = 70
if age < 18:
    print("Bilet ulgowy")
elif age < 65:
    print("Bilet normalny")
else:
    print("Bilet seniora")
```

Python sprawdza warunki od góry i wykonuje blok pierwszego, który daje `True`, i tylko ten. Blok `else` wykonuje się, gdy żaden nie daje `True`. Wypróbuj wiek 5, 30 i 65.

> [!NOTE]
> Wcięcia są częścią Pythona, a nie tylko kwestią stylu. Blok bez wcięcia albo z wierszami wciętymi różnie zatrzymuje program z błędem `IndentationError`, błędem wcięcia.

## Funkcje

Funkcji już używasz: to `print()`, `input()`, `int()` i `type()`. **Funkcja** to kawałek kodu z nazwą. **Wywołuje** się ją, pisząc jej nazwę i nawiasy, a w nawiasach to, czego potrzebuje, czyli jej **argumenty**.

`def` definiuje twoją własną funkcję:

```python run
def greet(name):
    print("Cześć,", name)


greet("Ada")
greet("Alan")
```

Po `def` jest nazwa funkcji, jej **parametry** w nawiasach i dwukropek. Pod nimi, z wcięciem, jest treść funkcji. Zdefiniowanie funkcji nie wykonuje jej treści. Dzieje się to przy każdym wywołaniu, a każdy parametr dostaje wtedy argument ze swojego miejsca: przy wywołaniu `greet("Ada")` parametr `name` to `"Ada"`.

### Zwracanie wartości

`return` (zwróć) kończy funkcję i oddaje wartość kodowi, który ją wywołał. Ten kod może zapisać wartość w zmiennej, wypisać ją albo wykonać na niej obliczenia:

```python run
def square(x):
    return x * x


result = square(4)
print(result)
print(square(3) + square(4))
```

`print` i `return` łatwo pomylić. `print` pokazuje wartość na ekranie, ale kod, który wywołał funkcję, nic nie dostaje. `return` oddaje wartość, więc kod może jej użyć. Funkcja, która kończy się bez `return`, zwraca `None`, czyli pythonowe „nic”:

```python run
def square(x):
    print(x * x)


result = square(4)
print(result)
```

Funkcja może zwrócić wynik porównania, `True` albo `False`, i wtedy odpowiada na pytanie „tak czy nie”:

```python run
def is_positive(number):
    return number > 0


print(is_positive(5))
print(is_positive(-2))
```

Treść funkcji nie może być pusta. Dopóki jej nie napiszesz, może ją zastąpić `pass`, które nic nie robi:

```python
def to_do():
    pass
```

### Plik jako program

Kod ćwiczeń w tym kursie często kończy się tak:

```python
if __name__ == "__main__":
    age = int(input())
    print(is_adult(age))
```

`__name__` to zmienna, którą Python ustawia sam. Wynosi `"__main__"`, gdy plik działa jako program, tak jak po naciśnięciu **Uruchom**. Gdy inny kod importuje plik, żeby korzystać z jego funkcji, `__name__` to nazwa pliku, a kod pod tym `if` się nie wykonuje. Właśnie tak robi **Sprawdź** na stronie: importuje twój kod i wywołuje twoje funkcje z własnymi argumentami, więc nie utknie, czekając na dane, których nikt nie wpisze.

## Twoja kolej

Ćwiczenie [Czy to już pełnoletność?](../../../exercises/02-python/01-basics/01-conditions-and-functions/01-old-enough/task.pl.md) zawiera program z początku tej lekcji, niedokończony. Napiszesz funkcję, która sprawdza, czy wiek to 18 lub więcej, przy użyciu porównania i `return`, i poprawisz część programu, która wczytuje wiek.
