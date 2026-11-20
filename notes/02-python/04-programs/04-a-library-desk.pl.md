---
description: Zbuduj wypożyczalnię książek z trzech części, sprawdzanego pliku z danymi, klasy z własnymi błędami i pętli poleceń, i zobacz, jak łączą się ze sobą lekcje.
---

# Projekt: wypożyczalnia

Mała biblioteka wypożycza książki swoim czytelnikom. Wie, jakie ma książki i ile egzemplarzy każdej, a także kto ma w tej chwili który egzemplarz, a przy ladzie wpisuje się polecenia takie jak `borrow Dune bob` i czeka na odpowiedź. W tej lekcji zbudujesz ten program w trzech częściach, a każda korzysta z tego, czego nauczyła któraś lekcja kursu: [plików i JSON-a](02-modules-and-the-standard-library.pl.md), [klas](01-classes.pl.md), [błędów](../03-errors-and-testing/01-exceptions.pl.md) i [testów](../03-errors-and-testing/02-testing-your-code.pl.md).

Program tej wielkości jest za duży, żeby napisać go za jednym zamachem, więc ta lekcja mówi o tym, **jak go budować**. Będą ci potrzebne:

- sposób na podzielenie programu na **warstwy**: dane, reguły i ekran,
- **własne błędy** dla tego, czego program musi odmówić,
- nawyk trzymania **wejścia i wyjścia na brzegu programu**, żeby resztę dało się przetestować,
- **małe kroki**, w których każdą warstwę sprawdza się, zanim zbuduje się na niej następną.

## Trzy warstwy

Spójrz na to, co robi program, i podziel to na warstwy:

1. **Dane.** Książki są zapisane w pliku JSON, który ludzie edytują ręcznie, więc program musi sprawdzić, co wczytuje, zanim temu zaufa.
2. **Reguły.** Książka ma egzemplarze, czytelnik nie może wypożyczyć tej samej książki dwa razy, a książki bez wolnych egzemplarzy nie da się wypożyczyć. To reguły biblioteki i nie obchodzi ich, czy pyta osoba przy klawiaturze, czy strona internetowa.
3. **Ekran.** Odczytanie linijki wpisanej przy ladzie, ustalenie, jakie to polecenie, i wypisanie odpowiedzi.

Każda warstwa rozmawia tylko z tą pod sobą: ekran wywołuje reguły, a reguły działają na sprawdzonych danych. Zmiana w jednym miejscu tam zostaje. Gdyby biblioteka dostała później stronę internetową zamiast klawiatury, trzeba by napisać od nowa tylko trzecią warstwę, a dane i reguły zostałyby bez zmian. Każda warstwa to jedno ćwiczenie.

## Warstwa 1: sprawdzone dane

Plik zawiera listę książek, a każda z nich to obiekt z czterema kluczami:

```python run
import json

text = """
[
  {"title": "Dune", "author": "Frank Herbert", "copies": 2, "borrowed": ["ann"]},
  {"title": "Emma", "author": "Jane Austen", "copies": 1, "borrowed": []}
]
"""

books = json.loads(text)
print(len(books), books[0]["title"], books[0]["borrowed"])
print(json.dumps(books[1]))
```

`json.loads()` daje listy i słowniki Pythona, a `json.dumps()` zapisuje je z powrotem i właśnie tak biblioteka będzie się zapisywać. `loads` sprawdza jednak tylko, czy tekst jest JSON-em, a nie czy opisuje bibliotekę: `[1, 2]` i `{"title": 5}` wczytują się bez problemu. Pierwsze ćwiczenie to funkcja, która sprawdza, klucz po kluczu, wszystko, na czym polega program, i zgłasza `ValueError` z informacją, gdzie jest pierwszy problem, na przykład `book 3: missing author`. Sprawdza w tej kolejności, od całego pliku do pojedynczych książek, więc komunikaty dotyczą najpierw najogólniejszego problemu.

Funkcja, która zatrzymuje złe dane już na wejściu, sprawia, że nic dalej nie musi się zastanawiać, czy książka ma `copies`.

## Własne błędy

Biblioteka ma własne rodzaje porażek: nie ma takiej książki albo nie został żaden egzemplarz. To nie są `ValueError` ani `KeyError`, a program z `except ValueError` nie wiedziałby, że pochodzą od biblioteki. Własny błąd to klasa wywodząca się z `Exception` i nie potrzebuje niczego w środku:

```python run
class LibraryError(Exception):
    pass


def borrow(copies_left):
    if copies_left == 0:
        raise LibraryError("no copies left")
    return copies_left - 1


try:
    print(borrow(1))
    print(borrow(0))
except LibraryError as error:
    print("The library says:", error)
```

`LibraryError` używa się tak samo jak `ValueError`, z `raise` i `except`, a jego komunikatem jest to, z czym go zgłoszono. Kod, który łapie `LibraryError`, łapie odmowy biblioteki i nic poza nimi, a `TypeError` wynikający z prawdziwej pomyłki w programie nadal zatrzymuje go ze śladem stosu. Ten błąd można też złapać jako `Exception`, bo z niego się wywodzi, co pokazuje `isinstance(error, Exception)`.

## Warstwa 2: reguły

Biblioteka to klasa, która przechowuje książki, a jej metody to reguły. Każda wyszukuje książkę, sprawdza, co trzeba, zmienia dane i mówi, co się stało:

```python run
class LibraryError(Exception):
    pass


class Library:
    def __init__(self, books):
        self.books = books

    def find(self, title):
        for book in self.books:
            if book["title"].lower() == title.strip().lower():
                return book
        raise LibraryError(f"no such book: {title}")

    def available(self, title):
        book = self.find(title)
        return book["copies"] - len(book["borrowed"])

    def borrow(self, title, member):
        book = self.find(title)
        if self.available(title) == 0:
            raise LibraryError(f"no copies left: {book['title']}")
        book["borrowed"].append(member)
        return self.available(title)


library = Library([{"title": "Dune", "author": "Frank Herbert", "copies": 1, "borrowed": []}])
print(library.borrow("dune", "bob"))
try:
    library.borrow("Dune", "cy")
except LibraryError as error:
    print(error)
```

`find` to jedyne miejsce, które wie, jak wyszukać książkę, bez względu na wielkość liter i przypadkowe spacje, a każda inna metoda je wywołuje, więc zmianę sposobu wyszukiwania wprowadza się raz. Błędy podają tytuł książki w jego właściwej postaci, `Dune`, a nie `dune` wpisane przy ladzie. Klasa nigdy niczego nie wypisuje i nie czyta z klawiatury: zwraca odpowiedź albo zgłasza błąd. Dzięki temu łatwo ją przetestować, tak jak robią to sprawdzenia drugiego ćwiczenia, z biblioteką zbudowaną w pamięci i kilkoma wywołaniami.

## Warstwa 3: ekran

Ostatnia warstwa czyta to, co wpisano, ustala, co to znaczy, i wypisuje wynik. Podziel ją na dwie części: funkcję, która zamienia linijkę na odpowiedź, i pętlę, która czyta i wypisuje. Funkcja zwraca tekst albo zgłasza błąd i niczego nie wypisuje:

```python run
class DeskError(Exception):
    pass


def run_command(total, line):
    words = line.split()
    if len(words) == 0:
        return total, None
    if words[0] == "add" and len(words) == 2:
        return total + int(words[1]), f"total is now {total + int(words[1])}"
    if words[0] == "total":
        return total, f"total is {total}"
    raise DeskError(f"unknown command: {words[0]}")


total = 0
while True:
    try:
        line = input("> ")
    except EOFError:
        break
    if line == "quit":
        print("Goodbye")
        break
    try:
        total, answer = run_command(total, line)
    except (DeskError, ValueError) as error:
        print(f"Error: {error}")
    else:
        if answer is not None:
            print(answer)
```

Ta mała lada dodaje liczby. Wpisz w polu **Wejście** polecenia, po jednym w linijce, na przykład `add 5`, `add x`, `total` i `quit`, i naciśnij **Uruchom**. Pętla jest tak mała, jak się da. Czyta linijkę, a `quit` ją kończy. W przeciwnym razie wywołuje `run_command` wewnątrz `try`, a błąd wypisuje jako `Error: ...` i działa dalej, dlatego literówka przy ladzie nie kończy programu. `EOFError` to błąd, który `input()` zgłasza, gdy skończą się wpisane linijki.

Lada w bibliotece ma ten sam kształt, tylko więcej poleceń: `list`, `borrow`, `return` i `who`. Tytuł może zawierać spacje, więc czytelnik to ostatnie słowo, a tytuł to wszystko między poleceniem a czytelnikiem.

## Małe kroki

Nie musisz pisać tego wszystkiego, zanim cokolwiek uruchomisz. W każdym ćwiczeniu **Sprawdź** mówi, które wywołania działają, a ty budujesz program krok po kroku:

1. Pisz `parse_books`, dopóki nie wczyta się poprawny plik, a potem dodawaj sprawdzenia po jednym. Każdy komunikat z tabeli to linijka albo dwie kodu.
2. Najpierw napisz `find`, bo korzystają z niej wszystkie pozostałe metody, a potem `available`, `borrow` i tak dalej.
3. Doprowadź do działania `list`, potem `borrow`, a błędy zostaw na koniec.

Gdy coś jest nie tak, sprawdzenia mówią, jakie wywołanie wykonały, czego oczekiwały i co dostały, i zwykle to wystarcza, żeby znaleźć linijkę z błędem. Gdzie dokładnie, mówi ślad stosu, który nauczyła cię czytać lekcja [Wyjątki](../03-errors-and-testing/01-exceptions.pl.md).

## Twoja kolej

Projekt składa się z trzech ćwiczeń. Każde opiera się na poprzednim i zaczyna od gotowego kodu poprzedniego, żeby można było pracować nad jedną warstwą naraz:

- W ćwiczeniu [Wczytaj książki](../../../exercises/02-python/04-programs/04-a-library-desk/01-load-the-books/task.pl.md) sprawdzisz plik z danymi, z komunikatem dla każdego rodzaju pomyłki.
- W ćwiczeniu [Biblioteka](../../../exercises/02-python/04-programs/04-a-library-desk/02-the-library/task.pl.md) napiszesz klasę: wyszukiwanie, wypożyczanie i zwracanie książek, własne błędy i zapisywanie.
- W ćwiczeniu [Lada](../../../exercises/02-python/04-programs/04-a-library-desk/03-the-desk/task.pl.md) napiszesz pętlę, która czyta polecenia wpisywane przy ladzie, odpowiada na nie i zgłasza błędy, nie przerywając pracy.
