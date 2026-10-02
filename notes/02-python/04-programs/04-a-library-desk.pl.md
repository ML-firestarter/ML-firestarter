---
description: Zbuduj kontuar biblioteki z trzech części, sprawdzanego pliku z danymi, klasy z własnymi błędami i pętli poleceń, i zobacz, jak pasują do siebie lekcje.
---

# Projekt: kontuar biblioteki

Mała biblioteka wypożycza książki swoim członkom. Wie, jakie książki posiada i ile egzemplarzy każdej, i kto ma teraz egzemplarz, a jej bibliotekarz wpisuje przy kontuarze rzeczy takie jak `borrow Dune bob` i oczekuje odpowiedzi. W tej lekcji zbudujesz ten program, w trzech częściach, a każda korzysta z tego, czego uczyła jakaś lekcja kursu: [plików i JSON](02-modules-and-the-standard-library.pl.md), [klas](01-classes.pl.md), [błędów](../03-errors-and-testing/01-exceptions.pl.md) i [testów](../03-errors-and-testing/02-testing-your-code.pl.md).

Program tej wielkości jest za duży, żeby napisać go za jednym razem, więc lekcja jest o tym, **jak go budować**. Potrzebujesz do tego:

- sposobu na podział programu na **warstwy**: dane, reguły i ekran,
- **własnych błędów**, dla rzeczy, których program musi odmówić,
- nawyku trzymania **wejścia i wyjścia na brzegu**, żeby resztę dało się testować,
- **małych kroków**, z każdą warstwą sprawdzoną, zanim zbuduje się na niej następną.

## Trzy warstwy

Spójrz, co robi program, i posortuj to na warstwy:

1. **Dane.** Książki żyją w pliku JSON, który ludzie edytują ręcznie, więc program musi sprawdzić to, co czyta, zanim temu zaufa.
2. **Reguły.** Książka ma egzemplarze, członek nie może wypożyczyć tej samej książki dwa razy, a książki bez wolnego egzemplarza nie da się wypożyczyć. To reguły o bibliotece i nie obchodzi ich, czy pyta osoba przy klawiaturze, czy strona internetowa.
3. **Ekran.** Przeczytanie linii wpisanej przez bibliotekarza, ustalenie, które to polecenie, i wypisanie odpowiedzi.

Każda warstwa rozmawia tylko z tą pod nią: ekran wywołuje reguły, a reguły pracują na danych, które sprawdzono. Zmiana w jednym miejscu tam zostaje. Gdyby biblioteka dostała później stronę internetową zamiast klawiatury, tylko trzecią warstwę trzeba by napisać od nowa, a dane i reguły zostałyby, jakie są. Każda warstwa to jedno ćwiczenie.

## Warstwa 1: dane, które sprawdzono

Plik ma listę książek, każda to obiekt z czterema kluczami:

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

`json.loads()` daje listy i słowniki Pythona, a `json.dumps()` zapisuje je z powrotem, i tak biblioteka się zapisze. `loads` sprawdza jednak tylko, że tekst jest JSON, a nie że to biblioteka: `[1, 2]` i `{"title": 5}` wczytują się bez problemu. Pierwsze ćwiczenie to funkcja, która przechodzi przez wszystko, na czym polega program, klucz po kluczu, i zgłasza `ValueError`, który mówi, gdzie jest pierwszy problem, jak `book 3: missing author`. Idzie w tej kolejności, od całego pliku w dół do każdej książki, więc komunikaty dotyczą najpierw najogólniejszego problemu.

Funkcja, która zatrzymuje złe dane przy drzwiach, sprawia, że nic po niej nie musi pytać, czy książka ma `copies`.

## Własne błędy

Biblioteka ma własne rodzaje porażek: nie ma takiej książki albo nie ma wolnego egzemplarza. To nie `ValueError` ani `KeyError`, a program, który czyta `except ValueError`, nie wiedziałby, że pochodzą z biblioteki. Własny błąd to klasa pochodząca od `Exception` i nie potrzebuje niczego w ciele:

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

`LibraryError` używa się tak jak `ValueError`, z `raise` i `except`, a komunikat to to, z czym go zgłoszono. Kod, który łapie `LibraryError`, łapie odmowy biblioteki i nic więcej, a `TypeError` z prawdziwego błędu w programie nadal zatrzymuje go śladem stosu. Błąd można też złapać jako `Exception`, bo od niego pochodzi, co pokazuje `isinstance(error, Exception)`.

## Warstwa 2: reguły

Biblioteka to klasa, która trzyma książki, a jej metody to reguły. Każda znajduje książkę, sprawdza to, co trzeba, zmienia dane i zgłasza, co się stało:

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

`find` to jedyne miejsce, które wie, jak znaleźć książkę, ignorując wielkie litery i zbłąkane spacje, i każda inna metoda je wywołuje, więc zmianę sposobu szukania robi się raz. Błędy mają własny tytuł książki, `Dune`, a nie `dune`, które wpisał bibliotekarz. Klasa nigdy nic nie wypisuje i nie czyta klawiatury: zwraca odpowiedź albo zgłasza błąd. Dzięki temu łatwo ją testować, tak jak robią to testy drugiego ćwiczenia, z biblioteką zbudowaną w pamięci i kilkoma wywołaniami.

## Warstwa 3: ekran

Ostatnia warstwa czyta to, co wpisano, ustala, co to znaczy, i wypisuje wynik. Podziel ją na dwie: funkcję, która zamienia linię na odpowiedź, i pętlę, która czyta i wypisuje. Funkcja zwraca tekst albo zgłasza błąd i niczego nie wypisuje:

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

Ten mały kontuar dodaje liczby. Wpisz polecenia w polu **Wejście**, po jednym w linii, jak `add 5`, `add x`, `total` i `quit`, i naciśnij **Uruchom**. Pętla jest tak mała, jak się da. Czyta linię, a `quit` ją kończy. W przeciwnym razie wywołuje `run_command` w `try`, a błąd jest wypisywany jako `Error: ...` i pętla idzie dalej, dlatego literówka przy kontuarze nie kończy programu. `EOFError` to to, co `input()` zgłasza, gdy skończą się wpisane linie.

Kontuar biblioteki ma ten sam kształt, z większą liczbą poleceń: `list`, `borrow`, `return` i `who`. Tytuł może mieć spacje, więc członek to ostatnie słowo, a tytuł to to, co między poleceniem a członkiem.

## Małe kroki

Nie musisz pisać tego wszystkiego, a potem uruchamiać. W każdym ćwiczeniu **Sprawdź** mówi, które wywołania działają, i budujesz po kolei:

1. Pisz `parse_books`, aż wczyta się poprawny plik, a potem dodawaj sprawdzenia po jednym. Każdy komunikat z tabeli to linia albo dwie.
2. Najpierw napisz `find`, bo używają go wszystkie pozostałe, a potem `available`, `borrow` i tak dalej.
3. Spraw, żeby działało `list`, potem `borrow`, a błędy na końcu.

Gdy coś jest nie tak, testy mówią, jakie wywołanie zrobiły, czego oczekiwały i co dostały, i zwykle to wystarcza, żeby znaleźć linię. Ślad stosu, który [lekcja o wyjątkach](../03-errors-and-testing/01-exceptions.pl.md) nauczyła cię czytać, mówi gdzie.

## Twoja kolej

Projekt to trzy ćwiczenia, każde buduje na poprzednim, a każde zaczyna się od napisanego kodu poprzedniego, żebyś mógł pracować nad jedną warstwą naraz:

- W ćwiczeniu [Wczytaj książki](../../../exercises/02-python/04-programs/04-a-library-desk/01-load-the-books/task.pl.md) sprawdzisz plik z danymi, z komunikatem dla każdego rodzaju pomyłki.
- W ćwiczeniu [Biblioteka](../../../exercises/02-python/04-programs/04-a-library-desk/02-the-library/task.pl.md) napiszesz klasę: znajdowanie, wypożyczanie i przyjmowanie książek, własne błędy i zapis.
- W ćwiczeniu [Kontuar](../../../exercises/02-python/04-programs/04-a-library-desk/03-the-desk/task.pl.md) napiszesz pętlę, która czyta polecenia bibliotekarza i odpowiada na nie, i zgłasza błędy bez zatrzymywania się.
