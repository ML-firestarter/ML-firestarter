---
description: Zapis i odczyt plików, słowniki list i sortowanie, do programu, który grupuje słowa według długości.
---

# Odczyt i zapis plików

Wszystko, co program trzyma w zmiennych, znika, gdy się kończy. Żeby zachować dane na później albo pracować na danych, które przygotował ktoś inny, programy czytają i zapisują **pliki**. W ćwiczeniu do tej lekcji wczytasz z pliku listę słów, pogrupujesz je według długości i zapiszesz grupy w nowym pliku. Potrzebujesz do tego:

- `open()` i `with`, które odczytują i zapisują pliki,
- `split()`, które tnie wiersz na słowa,
- **słownika list**, który grupuje wartości,
- `sorted()`, które je porządkuje.

Każdy przykład w tej lekcji działa we własnym, pustym folderze, więc przykłady zapisują plik, zanim go przeczytają.

## Zapisywanie pliku

`open()` otwiera plik i zwraca obiekt, za pomocą którego się na nim pracuje. Pierwszy argument to nazwa pliku, a drugi mówi, co chcesz z nim zrobić: `"w"` (ang. write) oznacza zapis. Metoda `write()` pliku zapisuje w nim tekst:

```python run
with open("zakupy.txt", "w") as file:
    file.write("jabłka\n")
    file.write("chleb\n")
    file.write("mleko\n")
print("Zapisano.")
```

`"w"` tworzy plik, a jeśli już istnieje, opróżnia go, więc używaj go ostrożnie. `write()`, w odróżnieniu od `print()`, sama nie kończy wiersza: robi to `"\n"`, czyli znak **nowego wiersza**.

`with` trzyma plik otwarty przez blok pod nim i zamyka go, gdy blok się kończy, nawet jeśli program zatrzyma błąd. W zamkniętym pliku wszystko, co do niego zapisano, jest już zachowane.

## Czytanie pliku

Bez drugiego argumentu `open()` otwiera plik do odczytu. Pętla `for` po pliku przechodzi przez jego wiersze:

```python run
with open("zakupy.txt", "w") as file:
    file.write("jabłka\nchleb\nmleko\n")

with open("zakupy.txt") as file:
    for line in file:
        print(line)
```

Każdy wiersz zachowuje `"\n"` na końcu, a `print()` dodaje własny znak nowego wiersza, więc między wierszami pojawiają się puste. `strip()` zwraca tekst bez spacji i znaków nowego wiersza na jego końcach:

```python run
with open("zakupy.txt", "w") as file:
    file.write("jabłka\nchleb\nmleko\n")

with open("zakupy.txt") as file:
    for line in file:
        item = line.strip()
        print(item, len(item))
```

`read()` wczytuje za to cały plik jako jeden napis:

```python run
with open("zakupy.txt", "w") as file:
    file.write("jabłka\nchleb\nmleko\n")

with open("zakupy.txt") as file:
    print(file.read())
```

Otwarcie do odczytu pliku, którego nie ma, zatrzymuje program z błędem `FileNotFoundError`:

```python run
with open("nie-ma-takiego-pliku.txt") as file:
    print(file.read())
```

## Dzielenie wierszy na słowa

Wiersz często zawiera kilka wartości, na przykład imię i liczbę. `split()` tnie napis w miejscach spacji i zwraca listę kawałków:

```python run
line = "Ada 36\n"
print(line.split())
print("jeden  dwa   trzy".split())
```

Znak nowego wiersza na końcu znika, podobnie jak powtórzone spacje. Gdy wiesz, ile będzie kawałków, możesz od razu przypisać je do zmiennych, tak jak `for name, age in ages.items()` rozkłada pary:

```python run
name, age = "Ada 36".split()
print(name)
print(int(age) + 1)
```

Kawałki to napisy, więc liczba wśród nich potrzebuje `int()`.

## Słowniki list

Wartościami słownika mogą być listy. Tak dzieli się wartości na grupy: klucz nazywa grupę, a jego lista trzyma wartości z tej grupy. Tutaj owoce są pogrupowane według pierwszej litery:

```python run
groups = {}
for fruit in ["arbuz", "banan", "awokado", "borówka", "czereśnia"]:
    first = fruit[0]
    if first not in groups:
        groups[first] = []
    groups[first].append(fruit)
print(groups)
```

Gdy litera pojawia się po raz pierwszy, nie jest jeszcze kluczem, więc pętla daje jej pustą listę. Po tym `if` litera ma listę tak czy inaczej, więc `groups[first].append()` dodaje do niej owoc.

## Sortowanie

`sorted()` zwraca nową listę z elementami listy albo innego ciągu, uporządkowanymi: liczby od najmniejszej, a napisy alfabetycznie.

```python run
print(sorted([5, 2, 9, 1]))
print(sorted(["gruszka", "arbuz", "figa"]))
```

Słownik trzyma klucze w kolejności, w jakiej je dodano. `sorted()` ze słownika daje jego klucze po kolei, a to wystarczy, żeby przejść przez słownik w tej kolejności:

```python run
counts = {"gruszka": 3, "arbuz": 5, "figa": 1}
print(sorted(counts))
for fruit in sorted(counts):
    print(f"{fruit}: {counts[fruit]}")
```

Żeby dostać cały nowy słownik z kluczami po kolei, posortuj pary, które daje `items()`, co ustawia je w kolejności kluczy, i zamień je z powrotem na słownik przez `dict()`:

```python run
counts = {"gruszka": 3, "arbuz": 5, "figa": 1}
print(dict(sorted(counts.items())))
```

> [!NOTE]
> `sorted()` porządkuje napisy według kodów znaków, więc polskie litery, takie jak ą czy ś, trafiają za z: `sorted(["śliwka", "zebra"])` daje `['zebra', 'śliwka']`.

## Twoja kolej

W ćwiczeniu [Pogrupuj słowa według długości](../../../exercises/02-python/01-basics/04-files/01-group-words-by-length/task.pl.md) w każdym wierszu pliku jest jedno słowo. Pogrupujesz słowa według długości w słowniku list, od najkrótszej długości do najdłuższej, i zapiszesz każdą grupę w innym pliku, w wierszu takim jak `2: if, in`.
