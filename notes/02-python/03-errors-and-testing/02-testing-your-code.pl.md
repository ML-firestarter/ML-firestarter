---
description: Testuj funkcję przez assert, małe funkcje testowe, unittest i doctest oraz napisz własny program uruchamiający testy.
---

# Testowanie kodu

Piszesz funkcję, uruchamiasz ją na jednym wejściu i wygląda dobrze. Potem ktoś daje jej pustą listę. **Testy** to sposób, żeby dowiedzieć się o tym pierwszym: pytania zadawane twojemu kodowi, zapisane z odpowiedziami, których oczekujesz, które można uruchomić od nowa po każdej zmianie. Tak działa każde ćwiczenie na tej stronie. Gdy naciskasz **Sprawdź**, strona wywołuje twoje funkcje na liście przypadków i porównuje to, co dają, z tym, co powinny.

W ćwiczeniu do tej lekcji napiszesz tę maszynerię sam, mały program uruchamiający testy. Potrzebujesz do tego:

- **`assert`**, które zatrzymuje program, gdy coś, co powinno być prawdą, nią nie jest,
- **funkcji testowych**, małych funkcji, które sprawdzają po jednej rzeczy,
- **przypadków testowych** i tego, jak je wybierać,
- **`unittest` i `doctest`**, dwóch narzędzi do testów, które są w Pythonie.

## assert

`assert` bierze warunek. Gdy jest prawdziwy, nic się nie dzieje. Gdy jest fałszywy, program zatrzymuje się z `AssertionError`, a opcjonalny komunikat po przecinku mówi, co było nie tak:

```python run
def median(numbers):
    ordered = sorted(numbers)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


assert median([3, 1, 2]) == 2
assert median([4, 1, 3, 2]) == 2.5, "even number of items"
assert median([5]) == 6, "one item"
print("all good")
```

Pierwsze dwa założenia przechodzą po cichu, a trzecie zatrzymuje program przed ostatnią linią, z `AssertionError: one item` i linią, w której jest, w śladzie stosu. „all good” na końcu nigdy się nie wypisze. `assert` służy do rzeczy, które muszą być prawdą, jeśli kod jest poprawny, i sprawdza własną pracę programu, a nie to, co wpisze użytkownik: do tego służą `if` i `raise`.

## Funkcje testowe

Test to funkcja, która sprawdza jedną rzecz i jest od niej nazwana. Test, który zawodzi, zgłasza `AssertionError`, a taki, który wraca bez błędu, przechodzi. Pętla, która uruchamia testy i łapie `AssertionError` każdego, może zdać raport ze wszystkich zamiast zatrzymać się na pierwszym:

```python run
def median(numbers):
    ordered = sorted(numbers)
    return ordered[len(ordered) // 2]


def test_odd_count():
    assert median([3, 1, 2]) == 2


def test_even_count():
    assert median([4, 1, 3, 2]) == 2.5


def test_one_item():
    assert median([7]) == 7


tests = [test_odd_count, test_even_count, test_one_item]
for test in tests:
    try:
        test()
        print("pass", test.__name__)
    except AssertionError:
        print("FAIL", test.__name__)
```

Ta `median` zapomina, że lista o parzystej długości ma dwa środkowe elementy, i drugi test to wykrywa. Funkcje to wartości, więc mogą leżeć na liście, a `test.__name__` to nazwa funkcji. Frameworki takie jak te poniżej znajdują testy i robią tę pętlę za ciebie.

## Wybór przypadków

Test jest tak dobry jak jego przypadki. Łatwo testować to, o czym się myślało, a błędy mieszkają gdzie indziej. Dla każdej funkcji spróbuj:

- **typowego wejścia**, jak `[3, 1, 2]`,
- **brzegów**: pusta lista, jeden element, najmniejsza i największa wartość, które powinny działać,
- **obu stron decyzji**: jeśli kod ma `if n % 2 == 1`, nieparzystej długości i parzystej,
- **tego, co powinno zawieść**: wejścia, które musi zgłosić błąd, jak pusta lista dla mediany.

Testy dla funkcji mediany takiej jak w ćwiczeniu, jako lista par argumentów i tego, co ma dać:

```python run
cases = [
    (([3, 1, 2],), 2),
    (([4, 1, 3, 2],), 2.5),
    (([7],), 7),
    (([],), ValueError),
]

for arguments, expected in cases:
    print(arguments, "->", expected)
```

Ostatni przypadek oczekuje **błędu**, więc jego „odpowiedzią” jest klasa `ValueError`, a nie wartość. Program z ćwiczenia musi odróżnić jedno od drugiego. `(arguments,)` to krotka z jedną listą, lista argumentów dla funkcji, która bierze jeden argument: `function(*arguments)` rozkłada krotkę na argumenty.

Liczby dziesiętne wymagają uwagi. `0.1 + 0.2 == 0.3` to `False`, bo liczby dziesiętne przechowuje się z maleńkim błędem. Porównuj je przez `math.isclose(a, b)` albo zaokrąglaj obie strony:

```python run
import math

print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(round(0.1 + 0.2, 2) == 0.3)
```

## unittest

`unittest` to narzędzie do testów, które jest w Pythonie. Testy to metody klasy pochodzącej od `unittest.TestCase`, a każda ma nazwę zaczynającą się od `test`. Klasa to sposób łączenia funkcji, który wyjaśnia [lekcja o klasach](../04-programs/01-classes.pl.md), więc na razie weź jej kształt, jaki jest. Metody `assert...` dają lepsze komunikaty niż zwykłe `assert`, a `assertRaises` sprawdza, że błąd jest zgłaszany:

```python run
import unittest


def median(numbers):
    if len(numbers) == 0:
        raise ValueError("no numbers")
    ordered = sorted(numbers)
    middle = len(ordered) // 2
    if len(ordered) % 2 == 1:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


class TestMedian(unittest.TestCase):
    def test_odd(self):
        self.assertEqual(median([3, 1, 2]), 2)

    def test_even(self):
        self.assertEqual(median([4, 1, 3, 2]), 2.5)

    def test_empty(self):
        with self.assertRaises(ValueError):
            median([])

    def test_wrong_on_purpose(self):
        self.assertEqual(median([1, 2]), 2)


unittest.main(argv=["tests"], exit=False)
```

`unittest.main()` znajduje testy, uruchamia je i wypisuje raport: kropkę dla każdego testu, który przeszedł, `F` dla każdego, który zawiódł, a dla każdej porażki to, co porównywał i co znalazł. Raport idzie na wyjście błędów, więc strona pokazuje go jako wyjście błędów, chociaż sam program działał dobrze. `argv=["tests"], exit=False` sprawia, że strona nie traktuje końca testów jako końca programu.

## doctest

`doctest` wyjmuje testy z dokumentacji. Docstring funkcji, tekst w potrójnych cudzysłowach tuż pod `def`, może pokazać, jak się jej używa, w postaci znaku zachęty Pythona, `>>>`, z wynikiem w następnej linii. `doctest.testmod()` uruchamia każdy i sprawdza wynik:

```python run
def double(x):
    """
    Double a number, or a text.

    >>> double(2)
    4
    >>> double("ab")
    'abab'
    >>> double(3)
    7
    """
    return x * 2


import doctest

print(doctest.testmod())
```

Zgłasza przykład, który zawiódł, z tym, czego oczekiwano i co dostał, a potem liczbę: `TestResults(failed=1, attempted=3)`. Doctesty są dobre do krótkich przykładów, które są też dokumentacją, a unittest do większych.

## Na twoim komputerze

Narzędzie, którego używa większość projektów w Pythonie, to **pytest**. Test to zwykła funkcja w pliku o nazwie `test_something.py`, napisana tak jak w części o funkcjach testowych, z samym `assert`, a `pytest` znajduje wszystkie i zgłasza każdą, która zawodzi, z wartościami po obu stronach. Z `uv`, z [lekcji o twoim komputerze](../04-programs/03-python-on-your-computer.pl.md):

```bash
uv add --dev pytest
uv run pytest
```

To ten sam pomysł co pętla z tej lekcji, z większą starannością. Pisanie testów funkcji *przed* funkcją, z przypadków tego, co ma robić, to dobry nawyk i to właśnie jest pisanie sprawdzeń ćwiczenia.

## Twoja kolej

W ćwiczeniu [Uruchom testy](../../../exercises/02-python/03-errors-and-testing/02-testing-your-code/01-run-the-tests/task.pl.md) napiszesz program uruchamiający testy: wywołuje funkcję na liście przypadków, oczekuje wartości albo błędów i zgłasza każdy przypadek, który wyszedł źle, słowami. To ta sama praca, którą przycisk **Sprawdź** robi na twoim kodzie.
