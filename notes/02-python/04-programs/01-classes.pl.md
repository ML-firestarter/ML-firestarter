---
description: Klasy z własnymi danymi i metodami, wypisywanie i łączenie wywołań, podklasy i obiekty, które można wywołać, do koszyka z zakupami.
---

# Klasy

Koszyk w sklepie trzyma zakupy i potrafi powiedzieć, ile razem kosztują. **Klasa** to sposób, w jaki Python łączy takie rzeczy: dane, które trzyma obiekt, tutaj zakupy, i funkcje, które na nich działają, tutaj dodanie rzeczy i policzenie sumy. Obiektów cudzych klas używasz od początku: napis wie, jak zrobić sobie `upper()`, a lista, jak zrobić `append()`.

W ćwiczeniu do tej lekcji napiszesz dwie klasy: koszyk i koszyk ze zniżką, który się na nim opiera. Potrzebujesz do tego:

- **klas**, **atrybutów** i **metod**, z `__init__` i `self`,
- `__repr__`, które mówi, jak obiekt się wypisuje,
- metody, która zwraca sam obiekt, żeby wywołania można było łączyć w łańcuch,
- **podklas**, które biorą to, co ma klasa, i zmieniają część z tego, przez `super()`,
- `__call__`, dzięki któremu obiekt można wywołać jak funkcję.

> [!NOTE]
> To także droga do PyTorcha. Model PyTorcha to klasa napisana dokładnie tak, jak pokazuje ta lekcja: jest podklasą `nn.Module`, ustawia swoje warstwy w `__init__` po wywołaniu `super().__init__()` i wywołuje się go jak funkcję.

## Obiekty i metody

Napis i lista to obiekty. Każdy trzyma własne dane, litery albo elementy, a metoda taka jak `upper()` czy `append()` działa na tych danych. Metodę wywołuje się z kropką po obiekcie:

```python run
word = "basket"
items = ["tea"]
print(word.upper())
items.append("cake")
print(items)
```

Dwa obiekty tego samego rodzaju nie dzielą danych: dopisanie do jednej listy zostawia drugą taką, jaka była.

## Pierwsza klasa

`class` tworzy nowy rodzaj obiektu. Oto taki, który liczy:

```python run
class Counter:
    def __init__(self):
        self.count = 0

    def up(self):
        self.count += 1


tally = Counter()
tally.up()
tally.up()
print(tally.count)

other = Counter()
print(other.count)
```

`Counter()` tworzy nowy obiekt, a Python wywołuje jego `__init__`, żeby go ustawić. Wewnątrz metody `self` to obiekt, na którym metodę wywołano, więc `self.count = 0` daje nowemu obiektowi **atrybut**, własną zmienną o nazwie `count`. W `tally.up()` Python przekazuje `tally` jako `self`, dlatego wywołanie nie ma argumentów, a metoda ma jeden parametr. Każda metoda zaczyna się od `self`.

`tally` i `other` to dwa obiekty jednej klasy, każdy z własnym `count`: `tally` doszedł do 2, a `other` nadal ma 0.

`__init__` może mieć więcej parametrów po `self` i pochodzą one z wywołania:

```python run
class Counter:
    def __init__(self, start=0):
        self.count = start

    def up(self, by=1):
        self.count += by


tally = Counter(10)
tally.up()
tally.up(5)
print(tally.count)
```

Metoda to funkcja, więc może mieć kolejne parametry, wartości domyślne i `return`.

> [!WARNING]
> Listę zakupów koszyka umieść w `__init__`, jako `self.items = []`. Lista napisana w samej klasie, poza jakąkolwiek metodą, byłaby jedną listą dla wszystkich obiektów i każdy koszyk trzymałby zakupy wszystkich pozostałych.

## Jak obiekt się wypisuje

Wypisanie obiektu klasy własnej na początku niewiele mówi:

```python run
class Basket:
    def __init__(self):
        self.items = []


print(Basket())
```

`0x…` to miejsce, w którym obiekt leży w pamięci. Metoda o nazwie `__repr__`, która zwraca napis, mówi Pythonowi, co wypisać zamiast tego. Nazwy z dwoma podkreślnikami po obu stronach są specjalne: Python sam je wywołuje w pewnych sytuacjach, więc nigdy nie piszesz `basket.__repr__()`:

```python run
class Basket:
    def __init__(self):
        self.items = []

    def __repr__(self):
        return f"Basket({len(self.items)} items)"


print(Basket())
```

## Metody, które zwracają obiekt

Metoda, która zmienia obiekt, zwykle nic nie zwraca, więc z wywołania dostajesz `None`. Jeśli kończy się na `return self`, oddaje obiekt, a następne wywołanie może iść od razu dalej, w łańcuchu:

```python run
class Basket:
    def __init__(self):
        self.items = []

    def add(self, name):
        self.items.append(name)
        return self

    def __repr__(self):
        return f"Basket({self.items})"


basket = Basket().add("tea").add("cake").add("jam")
print(basket)
```

Pierwsze `add` oddaje koszyk, a `.add("cake")` działa na nim. Bez `return self` drugie wywołanie byłoby `None.add(...)`, które zatrzymuje się z `AttributeError`.

## Podklasy

**Podklasa** to klasa zbudowana na innej. Jej nazwę wpisuje się w nawiasach po nazwie klasy i ma ona wszystko, co ma tamta klasa:

```python run
class Basket:
    def __init__(self):
        self.items = []

    def add(self, name):
        self.items.append(name)
        return self

    def count(self):
        return len(self.items)


class GiftBasket(Basket):
    pass


gift = GiftBasket().add("tea").add("cake")
print(gift.count())
print(isinstance(gift, Basket))
```

`GiftBasket` nic nie napisała i robi to, co `Basket`. `isinstance()` mówi, czy obiekt jest z klasy albo z jej podklasy.

Podklasa zmienia to, co trzeba, pisząc metodę o tej samej nazwie, która **nadpisuje** pierwszą. Jej własne ustawienia idą do jej własnego `__init__`, a `super()` sięga po klasę nad nią, więc podklasa może najpierw pozwolić tamtej klasie się ustawić, a potem dodać swoje:

```python run
class Basket:
    def __init__(self):
        self.items = []

    def add(self, name, price):
        self.items.append((name, price))
        return self

    def total(self):
        money = 0
        for name, price in self.items:
            money += price
        return money


class SaleBasket(Basket):
    def __init__(self, percent):
        super().__init__()
        self.percent = percent

    def total(self):
        return super().total() * (100 - self.percent) / 100


sale = SaleBasket(20).add("tea", 3).add("cake", 7)
print(sale.items)
print(sale.percent)
print(sale.total())
```

Zakupy to pary zapisane `(name, price)` w nawiasach: **krotka** to krótka lista wartości, której potem nie można zmienić, a `for name, price in self.items` rozbiera każdą parę, tak jak `for name, age in ages.items()` robi to dla słownika.

`super().__init__()` uruchamia `__init__` z `Basket`, który daje `sale` listę zakupów. Bez niego `SaleBasket` nigdy jej nie tworzy: pierwsze `add` zatrzymuje się z `AttributeError`. W `total()` `super().total()` to suma tak, jak liczy ją `Basket`, czyli 10, a `SaleBasket` odejmuje od niej 20 procent: 8.

## Obiekty, które można wywołać

Metoda o nazwie `__call__` pozwala wywołać obiekt jak funkcję, z nawiasami. Wywołanie uruchamia `__call__`:

```python run
class Line:
    def __init__(self, w, b):
        self.w = w
        self.b = b

    def __call__(self, x):
        return self.w * x + self.b


fare = Line(3, 10)
print(fare(4))
print(fare(10))
```

`fare` to obiekt, który pamięta `w` i `b`, a `fare(4)` to opłata za 4 km z nimi. Takie wywoływane obiekty są w PyTorchu wszędzie: `model(x)` uruchamia model na jego danych, a `__call__` robi to, uruchamiając metodę o nazwie `forward`. Model to podklasa klasy, która dostarcza `__call__`, i pisze własne `forward`:

```python run
class Module:
    def __call__(self, x):
        return self.forward(x)


class Line(Module):
    def __init__(self, w, b):
        super().__init__()
        self.w = w
        self.b = b

    def forward(self, x):
        return self.w * x + self.b


fare = Line(3, 10)
print(fare(4))
```

`Line` nie ma `__call__`, a `fare(4)` nadal działa, bo ma je `Module`, a `Line` jest jej podklasą. Tak robi `nn.Module` z PyTorcha i twoje własne modele, z dużo większą zawartością `Module`, a taką podklasę napiszesz w rozdziale o PyTorchu.

## Twoja kolej

W ćwiczeniu [Koszyk z zakupami](../../../exercises/02-python/04-programs/01-classes/01-shopping-basket/task.pl.md) połączysz to wszystko: `Basket`, który trzyma to, co do niego dodano, sumuje to i sam się wypisuje, i `DiscountBasket`, który jest `Basket` z procentem odjętym od sumy. Uważaj na `return self` na końcu `add()` i daj każdemu koszykowi własną listę.
