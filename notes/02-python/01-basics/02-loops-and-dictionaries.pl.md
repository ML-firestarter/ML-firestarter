---
description: Napisy, pętle for i słowniki, do programu, który liczy samogłoski w zdaniu.
---

# Pętle i słowniki

W ćwiczeniu do tej lekcji policzysz samogłoski w zdaniu: ile ma liter a, ile liter e i tak dalej. Ręcznie przechodzi się przez zdanie litera po literze i dla każdej samogłoski stawia kreski. Python robi to tak samo, za pomocą:

- **pętli for**, która wykonuje ten sam kod dla każdej litery tekstu albo każdego elementu listy,
- **słownika**, który przechowuje wartość, na przykład liczbę kresek, pod kluczem, na przykład literą.

## Tekst litera po literze

Napis to ciąg znaków, jeden po drugim: liter, cyfr, spacji i znaków interpunkcyjnych. `len()` podaje jego długość, a nawiasy kwadratowe wybierają jeden znak według jego pozycji, czyli **indeksu**. Indeksy liczy się od 0:

```python run
word = "Python"
print(len(word))
print(word[0])
print(word[5])
```

`in` sprawdza, czy jeden napis jest częścią drugiego, choćby pojedynczą literą:

```python run
print("y" in "Python")
print("a" in "Python")
print("tho" in "Python")
```

Napisy mają **metody**: funkcje, które do nich należą i które wywołuje się po kropce za napisem. `lower()` zwraca tekst zapisany małymi literami, a `upper()` wielkimi:

```python run
text = "Monty Python"
print(text.lower())
print(text.upper())
print(text)
```

Ostatni wiersz pokazuje, że sam `text` się nie zmienił. Napis nigdy się nie zmienia: metody takie jak `lower()` zwracają nowy. Żeby go zachować, zapisz go w zmiennej, nawet tej samej: `text = text.lower()`.

## Pętla for

Pętla `for` wykonuje swój blok raz dla każdego elementu ciągu, a zmienna ma za każdym razem wartość tego elementu. Elementy napisu to jego znaki:

```python run
for letter in "kot":
    print(letter)
print("Gotowe.")
```

Tak jak przy `if`, wiersz z `for` kończy się dwukropkiem, a blok pod nim jest wcięty. Za pierwszym wykonaniem bloku `letter` to `"k"`, potem `"o"`, a potem `"t"`. Po ostatniej literze program idzie dalej, za pętlę.

Pętla często buduje wynik po kawałku. Żeby coś policzyć, zacznij od zmiennej równej 0 i dodawaj do niej 1 za każdym razem, gdy to znajdziesz:

```python run
count = 0
for letter in "banan":
    if letter == "a":
        count += 1
print(count)
```

`if` jest wewnątrz pętli, więc ma jedno wcięcie, a wiersz pod nim dwa. Pętla sprawdza każdą literę, a `count` rośnie przy każdym `a`. `count += 1` to skrót od `count = count + 1`, a `-=` i `*=` działają tak samo.

## Słowniki

Żeby policzyć każdą samogłoskę, potrzebna byłaby osobna zmienna dla każdej z nich. **Słownik** trzyma je wszystkie razem. Przechowuje pary **klucz** i **wartość** i znajduje każdą wartość po jej kluczu, tak jak papierowy słownik znajduje znaczenie słowa po samym słowie. Zapisuje się go w nawiasach klamrowych, z dwukropkiem między każdym kluczem a jego wartością:

```python run
ages = {"Ada": 36, "Alan": 41}
print(ages)
print(ages["Ada"])
```

Nawiasy kwadratowe z kluczem odczytują jego wartość, a `=` ją zmienia albo dodaje klucz, jeśli słownik jeszcze go nie ma:

```python run
ages = {"Ada": 36, "Alan": 41}
ages["Ada"] = 37
ages["Grace"] = 85
print(ages)
print(len(ages))
```

Odczytanie klucza, którego nie ma, zatrzymuje program z błędem `KeyError`, więc najpierw sprawdź. `in` sprawdza, czy słownik ma dany klucz:

```python run
ages = {"Ada": 36, "Alan": 41}
print("Ada" in ages)
print("Linus" in ages)
print(ages["Linus"])
```

Wartość w słowniku zwiększasz przez `+=`, tak jak każdą zmienną:

```python run
counts = {"a": 0, "b": 0}
counts["a"] += 1
counts["a"] += 1
print(counts)
```

Wstaw to do pętli, a policzysz każdą literę słowa. Gdy litera pojawia się po raz pierwszy, nie ma jej jeszcze w słowniku, więc pętla dodaje ją z liczbą 1. Potem jej liczba już tylko rośnie:

```python run
counts = {}
for letter in "banan":
    if letter in counts:
        counts[letter] += 1
    else:
        counts[letter] = 1
print(counts)
```

## Przechodzenie po słowniku

Pętla `for` po słowniku przechodzi po jego kluczach. `items()` podaje klucze razem z wartościami, parami, a pętla może rozłożyć każdą parę na dwie zmienne:

```python run
ages = {"Ada": 36, "Alan": 41, "Grace": 85}
for name in ages:
    print(name)
for name, age in ages.items():
    print(name, age)
```

Klucze idą w kolejności, w jakiej je dodano do słownika. To nie jest kolejność alfabetyczna ani żadna inna, chyba że w takiej je dodano.

## f-stringi

**f-string** ma `f` przed cudzysłowem otwierającym. Wstawia do swojego tekstu wartości wyrażeń zapisanych w nawiasach klamrowych:

```python run
name = "Ada"
age = 36
print(f"{name} ma {age} lat")
print(f"{name}: {age + 1} za rok")
```

Dzięki temu łatwo wypisać wyniki w ustalonym formacie, na przykład `a: 2`:

```python run
counts = {"b": 1, "a": 2, "n": 2}
for letter, count in counts.items():
    print(f"{letter}: {count}")
```

## Twoja kolej

W ćwiczeniu [Policz samogłoski](../../../exercises/02-python/01-basics/02-loops-and-dictionaries/01-count-the-vowels/task.pl.md) napiszesz funkcję, która liczy w słowniku każdą samogłoskę tekstu, także zapisaną wielką literą, i pętlę, która wypisuje te liczby w alfabetycznej kolejności samogłosek.
