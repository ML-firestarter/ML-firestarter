---
description: Indeksy, wycinki, listy list i własne błędy, do szyfru płotkowego.
---

# Listy list

**Szyfr płotkowy** to dawny sposób ukrywania wiadomości. Jej litery zapisuje się zygzakiem w kilku wierszach, zwanych szynami, a potem odczytuje szyny jedną po drugiej. Oto „Podstawy pythona” na 3 szynach, bez spacji:

```text
P . . . t . . . p . . . o . .
. o . s . a . y . y . h . n .
. . d . . . w . . . t . . . a
```

Szyna po szynie daje to `Ptpo`, `osayyhn` i `dwta`, więc tajna wiadomość to `Ptpoosayyhndwta`. Łatwo ją odwrócić tylko wtedy, gdy się wie, że szyny były 3.

W ćwiczeniu do tej lekcji napiszesz ten szyfr w Pythonie. Każda szyna to lista liter, więc cały płot to lista list, a numer wiersza chodzi po nim w dół i w górę. Potrzebujesz do tego:

- **indeksów** i **wycinków**, które wybierają elementy z list i napisów,
- **list list**,
- zmiennej, która chodzi tam i z powrotem,
- `raise`, które zatrzymuje funkcję, gdy dostanie argument, z którym nie może nic zrobić.

## Indeksy i wycinki

Indeks elementu to jego pozycja na liście, liczona od 0. Ujemne indeksy liczą od końca: `-1` to ostatni element, a `-2` przedostatni. Indeks z `=` zmienia element:

```python run
letters = ["a", "b", "c", "d", "e"]
print(letters[0])
print(letters[-1])
letters[1] = "B"
print(letters)
```

Indeks za końcem listy zatrzymuje program z błędem `IndexError`: lista 5 elementów ma indeksy od 0 do 4.

```python run
letters = ["a", "b", "c", "d", "e"]
print(letters[5])
```

**Wycinek** (ang. slice) wybiera kilka elementów naraz: `[start:stop]` daje te od `start` do `stop`, ale bez niego, tak jak `range()`. Bez `start` wycinek zaczyna się od początku, a bez `stop` biegnie do końca. Wycinki działają też na napisach:

```python run
letters = ["a", "b", "c", "d", "e"]
print(letters[1:3])
print(letters[:2])
print(letters[2:])
print("Python"[0:2])
```

`list()` zamienia napis na listę jego znaków, a `pop(0)` wyjmuje z listy pierwszy element i go zwraca:

```python run
letters = list("abc")
print(letters)
first = letters.pop(0)
print(first)
print(letters)
```

## Listy list

Lista może przechowywać dowolne wartości, także inne listy. Lista list działa jak tabela: pierwszy indeks wybiera wiersz, a drugi element w tym wierszu:

```python run
grid = [["a", "b"], ["c", "d"], ["e", "f"]]
print(grid[1])
print(grid[1][0])
grid[2].append("g")
print(grid)
```

Listę z pustą listą dla każdej szyny tworzy wyrażenie listowe:

```python run
rails = [[] for _ in range(3)]
print(rails)
rails[0].append("x")
print(rails)
```

`_` to nazwa zmiennej jak każda inna. Zwyczajowo nazywa się tak zmienną, której się nie używa: tutaj pętla tylko liczy do 3.

`[[]] * 3` wygląda, jakby robiło to samo, ale tak nie jest. `*` powtarza elementy listy, a tutaj elementem jest jedna pusta lista, więc wynik zawiera trzy razy tę samą listę. Dodanie czegoś do jednej dodaje to do wszystkich trzech:

```python run
rails = [[]] * 3
rails[0].append("x")
print(rails)
```

## Tam i z powrotem

Zygzak potrzebuje numeru wiersza, który idzie 0, 1, 2, wraca przez 1 do 0 i znów idzie w dół. Trzymaj wiersz w jednej zmiennej, a kierunek w drugiej, `step`: 1 w dół i -1 w górę. Po każdej literze wiersz przesuwa się o `step`, a `step` zawraca na górnej i dolnej szynie:

```python run
rails = 3
row = 0
step = 1
for letter in "abcdefghi":
    print(letter, row)
    if row == 0:
        step = 1
    elif row == rails - 1:
        step = -1
    row += step
```

Dolna szyna to `rails - 1`, bo szyny liczy się od 0. Zmień `rails` na 2 albo 4 i zobacz, jak zmienia się zygzak.

## Zamienianie i łączenie

`replace()` zwraca napis, w którym każde wystąpienie jednego fragmentu tekstu jest zamienione na inny. Zamiana na `""`, pusty napis, usuwa fragment:

```python run
text = "Podstawy pythona"
print(text.replace(" ", ""))
print(text.replace("o", "0"))
```

`"".join()`, z pustym napisem przed kropką, łączy listę napisów bez niczego pomiędzy:

```python run
rail = ["P", "t", "p", "o"]
print("".join(rail))
```

`+` też łączy dwa napisy, więc pętla może budować napis kawałek po kawałku, zaczynając od pustego:

```python run
word = ""
for piece in ["Py", "th", "on"]:
    word += piece
print(word)
```

## Zgłaszanie błędów

Niektóre argumenty nie mają sensu dla funkcji: płot nie może mieć 0 szyn. Zamiast zwracać zły wynik, funkcja może się zatrzymać z błędem, tak jak robią to wbudowane funkcje Pythona, przez `raise` (zgłoś):

```python run
def average(numbers):
    if len(numbers) == 0:
        raise ValueError("brak liczb do uśrednienia")
    return sum(numbers) / len(numbers)


print(average([2, 4, 9]))
print(average([]))
```

`sum()` dodaje liczby z listy. `ValueError` to rodzaj błędu dla argumentu dobrego typu, ale ze złą wartością, jak tekst w `int("dwadzieścia")`. Komunikat w nawiasach mówi, co poszło nie tak, i pojawia się w ostatnim wierszu błędu. W ćwiczeniach sprawdzenie takie jak `rail_fence('abc', 0)`, które oczekuje `ValueError`, przechodzi, gdy funkcja taki błąd zgłosi.

## Twoja kolej

W ćwiczeniu [Szyfr płotkowy](../../../exercises/02-python/01-basics/05-lists-of-lists/01-rail-fence-cipher/task.pl.md) połączysz to wszystko: pominiesz spacje, rozłożysz litery zygzakiem na szynach i odczytasz je szyna po szynie. Uważaj na płot z jedną szyną i na ten bez żadnej.
