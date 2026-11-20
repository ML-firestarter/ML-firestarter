---
description: Testuj funkcję przez assert, małe funkcje testowe, unittest i doctest, i napisz własny program do uruchamiania testów.
---

# Testowanie kodu

Piszesz funkcję, uruchamiasz ją na jednym wejściu i wszystko wygląda dobrze. Potem ktoś daje jej pustą listę. **Testy** pozwalają dowiedzieć się o tym wcześniej: to pytania do kodu, zapisane razem z oczekiwanymi odpowiedziami, które można uruchomić ponownie po każdej zmianie. Tak działa każde ćwiczenie na tej stronie. Gdy naciskasz **Sprawdź**, strona wywołuje twoje funkcje na liście przypadków i porównuje to, co zwracają, z tym, co powinny zwrócić.

W ćwiczeniu do tej lekcji sam napiszesz taki mechanizm, czyli mały program do uruchamiania testów. Będą ci potrzebne:

- **`assert`**, który zatrzymuje program, gdy coś, co powinno być prawdą, nią nie jest,
- **funkcje testowe**, czyli małe funkcje, z których każda sprawdza jedną rzecz,
- **przypadki testowe** i sposób ich wybierania,
- **`unittest` i `doctest`**, dwa narzędzia do testowania, które Python ma od razu.

## assert

`assert` przyjmuje warunek. Gdy jest prawdziwy, nic się nie dzieje. Gdy jest fałszywy, program zatrzymuje się z błędem `AssertionError`, a opcjonalny komunikat po przecinku mówi, co było nie tak:

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

Dwie pierwsze asercje przechodzą po cichu, a trzecia zatrzymuje program przed ostatnią linijką, z `AssertionError: one item` i swoją linijką w śladzie stosu. Napis „all good” na końcu nigdy się nie wypisuje. `assert` służy do sprawdzania rzeczy, które muszą być prawdą, jeśli kod jest poprawny, czyli sprawdza pracę samego programu, a nie to, co wpisuje użytkownik: do tego służą `if` i `raise`.

## Funkcje testowe

Test to funkcja, która sprawdza jedną rzecz i od niej bierze nazwę. Test, który nie przechodzi, zgłasza `AssertionError`, a ten, który kończy się bez błędu, przechodzi. Pętla, która uruchamia testy i łapie `AssertionError` każdego z nich, może opisać wszystkie, zamiast zatrzymywać się na pierwszym:

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

Ta funkcja `median` zapomina, że lista o parzystej długości ma dwa środkowe elementy, i wykrywa to drugi test. Funkcje to wartości, więc mogą leżeć na liście, a `test.__name__` to nazwa funkcji. Narzędzia opisane niżej same znajdują testy i wykonują za ciebie tę pętlę.

## Wybór przypadków

Test jest tak dobry jak jego przypadki. Łatwo przetestować to, o czym się myślało, a błędy siedzą gdzie indziej. Dla każdej funkcji wypróbuj:

- **typowe wejście**, na przykład `[3, 1, 2]`,
- **przypadki brzegowe**: pustą listę, jeden element, najmniejszą i największą wartość, która powinna działać,
- **obie strony decyzji**: jeśli w kodzie jest `if n % 2 == 1`, długość nieparzystą i parzystą,
- **to, co ma się nie udać**: wejście, które musi zgłosić błąd, na przykład pustą listę w przypadku mediany.

Oto testy funkcji liczącej medianę, takiej jak w ćwiczeniu, zapisane jako lista par: argumenty i to, co funkcja powinna zwrócić:

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

Ostatni przypadek oczekuje **błędu**, więc jego „odpowiedzią” jest klasa `ValueError`, a nie wartość. Program uruchamiający testy w ćwiczeniu musi odróżniać te dwie sytuacje. `(arguments,)` to krotka z jedną listą, czyli lista argumentów funkcji, która przyjmuje jeden argument: `function(*arguments)` rozkłada krotkę na argumenty.

Liczby dziesiętne wymagają ostrożności. `0.1 + 0.2 == 0.3` to `False`, bo liczby dziesiętne są przechowywane z drobnym błędem. Porównuj je przez `math.isclose(a, b)` albo zaokrąglaj obie strony:

```python run
import math

print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(round(0.1 + 0.2, 2) == 0.3)
```

## unittest

`unittest` to narzędzie do testowania, które Python ma od razu. Testy to metody klasy wywodzącej się z `unittest.TestCase`, a nazwa każdej z nich zaczyna się od `test`. Klasa to sposób na zebranie funkcji w całość, który wyjaśnia lekcja [Klasy](../04-programs/01-classes.pl.md), więc na razie przyjmij jej kształt taki, jaki jest. Metody `assert...` dają lepsze komunikaty niż zwykły `assert`, a `assertRaises` sprawdza, czy zgłoszono błąd:

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

`unittest.main()` znajduje testy, uruchamia je i wypisuje raport: kropkę dla każdego testu, który przeszedł, `F` dla każdego, który nie przeszedł, a przy każdym niepowodzeniu to, co porównywano, i to, co wyszło. Raport trafia na wyjście błędów, więc strona pokazuje go jako błędy, choć sam program zadziałał poprawnie. `argv=["tests"], exit=False` sprawia, że strona nie traktuje końca testów jako końca programu.

## doctest

`doctest` bierze testy z dokumentacji. Docstring funkcji, czyli tekst w potrójnych cudzysłowach tuż pod `def`, może pokazywać, jak się jej używa, w postaci znaku zachęty Pythona, `>>>`, z wynikiem w następnej linijce. `doctest.testmod()` uruchamia każdy taki przykład i sprawdza wynik:

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

Wypisuje przykład, który nie przeszedł, z tym, czego oczekiwał, i tym, co dostał, a potem podsumowanie: `TestResults(failed=1, attempted=3)`. Doctesty dobrze sprawdzają się przy krótkich przykładach, które przy okazji są dokumentacją, a unittest przy całej reszcie.

## Na twoim komputerze

Większość projektów w Pythonie korzysta z narzędzia **pytest**. Test to zwykła funkcja w pliku o nazwie `test_something.py`, napisana tak jak w części o funkcjach testowych, ze zwykłym `assert`, a `pytest` znajduje je wszystkie i zgłasza każdą, która nie przechodzi, z wartościami po obu stronach porównania. Z `uv`, które poznasz w [lekcji o Pythonie na twoim komputerze](../04-programs/03-python-on-your-computer.pl.md):

```bash
uv add --dev pytest
uv run pytest
```

To ta sama idea co pętla z tej lekcji, tylko dopracowana. Pisanie testów funkcji *przed* samą funkcją, na podstawie przypadków tego, co ma robić, to dobry nawyk, i właśnie tak powstają sprawdzenia do ćwiczeń.

## Twoja kolej

W ćwiczeniu [Uruchom testy](../../../exercises/02-python/03-errors-and-testing/02-testing-your-code/01-run-the-tests/task.pl.md) napiszesz program do uruchamiania testów: wywołuje funkcję na liście przypadków, oczekuje wartości albo błędów i opisuje słowami każdy przypadek, który poszedł źle. To ta sama praca, którą przycisk **Sprawdź** wykonuje na twoim kodzie.
