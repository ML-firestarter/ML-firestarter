---
description: Reszta z dzielenia, range, listy i błędy, które nie zatrzymują programu, do programu, który szuka liczb pierwszych.
---

# Zakresy i listy

**Liczba pierwsza** to liczba całkowita większa od 1, która dzieli się bez reszty tylko przez 1 i przez samą siebie: 2, 3, 5, 7, 11, 13 i tak dalej. W ćwiczeniu do tej lekcji poprawisz program, który wypisuje liczby pierwsze między dwiema liczbami. Działa bez błędu, ale niektóre jego wyniki są złe, a taki błąd najtrudniej znaleźć, bo Python go nie wskaże. Żeby zrozumieć ten program i go poprawić, potrzebujesz:

- `%`, który mówi, czy jedna liczba dzieli drugą,
- `range()`, które przechodzi przez ciąg liczb,
- `return` wewnątrz pętli, które kończy funkcję, gdy tylko zna ona odpowiedź,
- **list**, które zbierają wyniki.

## Reszta z dzielenia i podzielność

`//` dzieli i zaokrągla w dół do liczby całkowitej, a `%` podaje to, co zostaje, czyli **resztę z dzielenia**:

```python run
print(17 // 5)
print(17 % 5)
```

5 mieści się w 17 trzy razy w całości i zostają 2: 17 = 3 × 5 + 2. Gdy reszta wynosi 0, dzielenie wychodzi bez reszty, więc `n % d == 0` pyta, czy `d` dzieli `n`:

```python run
print(12 % 3 == 0)
print(12 % 5 == 0)
print(10 % 2 == 0)
```

Tak samo `n % 2 == 0` odróżnia liczby parzyste od nieparzystych.

## Liczenie z range

`range()` daje ciąg liczb całkowitych, przez który przechodzi pętla `for`. `range(5)` liczy od 0 do 5, **ale bez samej 5**:

```python run
for number in range(5):
    print(number)
```

Z dwiema liczbami `range(start, stop)` zaczyna od `start`, a nie od 0, i nadal kończy przed `stop`:

```python run
for number in range(3, 7):
    print(number)
```

Zatem `range(1, 10)` idzie od 1 do 9. Żeby objąć ostatnią liczbę, `stop` musi być o jeden większy: `range(1, 11)` idzie od 1 do 10. A zakres, którego `stop` nie jest większy od `start`, jest pusty, więc pętla po nim nie wykona się ani razu:

```python run
for number in range(5, 5):
    print(number)
print("Pętla się nie wykonała.")
```

Zapominanie, że `range` pomija swój `stop`, jest tak częste, że ta pomyłka ma swoją nazwę: **błąd o jeden** (ang. off-by-one error), gdy pętla wykonuje się o jeden raz za dużo albo za mało.

## Wcześniejsze wyjście z funkcji

`return` kończy funkcję od razu, nawet w środku pętli. Dzięki temu funkcja, która czegoś szuka, może zwrócić wynik, gdy tylko to znajdzie, a drugą odpowiedź zwrócić po pętli, gdy już przejrzała wszystko i nic nie znalazła:

```python run
def has_digit(text):
    for character in text:
        if character in "0123456789":
            return True
    return False


print(has_digit("R2D2"))
print(has_digit("Python"))
```

Dla `"R2D2"` pętla kończy się na `2`, a funkcja zwraca `True`, nie patrząc na resztę. Dla `"Python"` pętla sprawdza każdą literę, nie znajduje cyfry i się kończy, a funkcja przechodzi do `return False`.

Liczby pierwsze sprawdza się tak samo: liczba jest pierwsza, chyba że coś ją dzieli, więc funkcja przegląda możliwe dzielniki i zwraca `False` przy pierwszym, który dzieli liczbę.

## Moduły i pierwiastki

Python ma **moduły**, czyli zbiory gotowych funkcji do najróżniejszych zadań, które program wczytuje przez `import`. Moduł `math` ma funkcje matematyczne, na przykład `math.sqrt()`, która liczy pierwiastek kwadratowy:

```python run
import math

print(math.sqrt(49))
print(math.sqrt(10))
```

`math.sqrt()` daje liczbę **zmiennoprzecinkową** (ang. float), z częścią dziesiętną. `int()` zamienia ją na liczbę całkowitą, odcinając wszystko po kropce, bez zaokrąglania:

```python run
import math

print(int(math.sqrt(10)))
print(int(3.99))
```

Pierwiastki oszczędzają dużo pracy przy liczbach pierwszych. Jeśli liczba `n` dzieli się przez coś, to jest iloczynem `a × b` dwóch liczb całkowitych, a `a` i `b` nie mogą obie być większe od √n, bo wtedy ich iloczyn byłby większy od `n`. Jeśli więc żadna liczba od 2 do √n nie dzieli `n`, to nie podzieli jej też żadna inna. Dla 97 oznacza to sprawdzenie liczb od 2 do 9 zamiast wszystkich od 2 do 96.

## Listy

**Lista** przechowuje wartości po kolei. Zapisuje się ją w nawiasach kwadratowych, z przecinkami między wartościami:

```python run
primes = [2, 3, 5, 7]
print(primes)
print(len(primes))
print(primes[0])
```

Tak jak przy napisach, `len()` podaje długość listy, a `[0]` wybiera jej pierwszy element. W odróżnieniu od napisów listy można zmieniać: `append()` dodaje element na końcu. Pętla, która zbiera wyniki, często zaczyna od pustej listy, `[]`, i po drodze dopisuje do niej kolejne elementy:

```python run
evens = []
for number in range(1, 11):
    if number % 2 == 0:
        evens.append(number)
print(evens)
```

**Wyrażenie listowe** (ang. list comprehension) tworzy taką listę w jednym wierszu: najpierw to, co trafia na listę, potem pętla, a potem, jeśli trzeba, warunek:

```python run
evens = [number for number in range(1, 11) if number % 2 == 0]
squares = [number * number for number in range(1, 6)]
print(evens)
print(squares)
```

Żeby wypisać elementy listy bez nawiasów, `", ".join()` łączy je w jeden napis, z `", "` między każdymi dwoma. Łączy tylko napisy, więc liczby trzeba najpierw przepuścić przez `str()`, które zamienia je na tekst:

```python run
primes = [2, 3, 5, 7]
print(", ".join([str(prime) for prime in primes]))
print(" - ".join(["a", "b", "c"]))
```

## Błędy, które nie zatrzymują programu

Niektóre błędy zatrzymują program z komunikatem, który mówi, co poszło nie tak i gdzie, jak `TypeError` przy porównaniu liczby z tekstem. Błąd w logice, na przykład `range`, który kończy się o jedną liczbę za wcześnie, nie daje żadnego komunikatu: program dochodzi do końca ze złym wynikiem i nic cię o tym nie informuje.

```python run
def count_up_to(n):
    return [number for number in range(1, n)]


print(count_up_to(3))
```

`count_up_to(3)` powinno dać `[1, 2, 3]`, ale brakuje 3, bo `stop` powinien wynosić `n + 1`. Taki błąd znajdziesz tylko w jeden sposób: sprawdzając kod na przypadkach, których wynik znasz, zwłaszcza najmniejszych i tych na krańcach. Właśnie to robi **Sprawdź** na stronie: każde sprawdzenie wywołuje funkcję z argumentami o znanym wyniku i mówi, które wywołania wychodzą źle. Dla liczb pierwszych dobre przypadki to najmniejsze liczby, 0, 1 i 2, oraz kwadraty liczb pierwszych, takie jak 4, 9 i 25, których jedynym dzielnikiem poza 1 i nimi samymi jest ich pierwiastek.

## Twoja kolej

Program w ćwiczeniu [Popraw wyszukiwarkę liczb pierwszych](../../../exercises/02-python/01-basics/03-ranges-and-lists/01-fix-the-prime-finder/task.pl.md) ma trzy takie błędy. Przeczytaj sprawdzenia, które nie przechodzą, ustal, na który wiersz wskazuje każde z nich, i go popraw.
