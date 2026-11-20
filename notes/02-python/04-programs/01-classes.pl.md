---
description: Klasy z własnymi danymi i metodami, wypisywanie obiektów i łańcuchy wywołań, podklasy i obiekty, które można wywołać, na przykładzie koszyka z zakupami.
---

# Klasy

Koszyk w sklepie przechowuje produkty i potrafi powiedzieć, ile razem kosztują. **Klasa** to sposób, w jaki Python łączy takie rzeczy w całość: dane, które obiekt przechowuje, tutaj produkty, i funkcje, które na nich działają, tutaj dodawanie produktu i liczenie sumy. Przez cały czas korzystasz z obiektów cudzych klas: napis potrafi zamienić się na wielkie litery przez `upper()`, a lista dopisać element przez `append()`.

W ćwiczeniu do tej lekcji napiszesz dwie klasy: koszyk i zbudowany na jego podstawie koszyk ze zniżką. Będą ci potrzebne:

- **klasy**, **atrybuty** i **metody**, z `__init__` i `self`,
- `__repr__`, które mówi, jak wypisuje się obiekt,
- metoda zwracająca sam obiekt, dzięki której wywołania można łączyć w łańcuch,
- **podklasy**, które przejmują to, co ma klasa, i część z tego zmieniają, z `super()`,
- `__call__`, dzięki któremu obiekt można wywołać jak funkcję.

> [!NOTE]
> To także droga do PyTorcha. Model w PyTorchu to klasa napisana dokładnie tak, jak pokazuje ta lekcja: jest podklasą `nn.Module`, przygotowuje swoje warstwy w `__init__` po wywołaniu `super().__init__()` i wywołuje się go jak funkcję.

## Obiekty i metody

Napis i lista to obiekty. Każdy przechowuje własne dane, litery albo elementy, a metoda taka jak `upper()` czy `append()` działa na tych danych. Metodę wywołuje się po kropce za obiektem:

```python run
word = "basket"
items = ["tea"]
print(word.upper())
items.append("cake")
print(items)
```

Dwa obiekty tego samego rodzaju nie dzielą danych: dopisanie elementu do jednej listy nie zmienia drugiej.

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

`Counter()` tworzy nowy obiekt, a Python wywołuje jego `__init__`, żeby go przygotować. Wewnątrz metody `self` to obiekt, na którym metodę wywołano, więc `self.count = 0` daje nowemu obiektowi **atrybut**, czyli własną zmienną o nazwie `count`. W `tally.up()` Python przekazuje `tally` jako `self`, dlatego wywołanie nie ma argumentów, a metoda ma jeden parametr. Każda metoda zaczyna się od `self`.

`tally` i `other` to dwa obiekty jednej klasy, każdy z własnym `count`: licznik `tally` doszedł do 2, a `other` nadal ma 0.

`__init__` może mieć po `self` kolejne parametry, a ich wartości pochodzą z wywołania:

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

Metoda to funkcja, więc może mieć więcej parametrów, wartości domyślne i `return`.

> [!WARNING]
> Listę produktów koszyka utwórz w `__init__`, jako `self.items = []`. Lista zapisana w samej klasie, poza jakąkolwiek metodą, byłaby jedną listą wspólną dla wszystkich obiektów, a każdy koszyk zawierałby produkty wszystkich pozostałych.

## Jak wypisuje się obiekt

Wypisanie obiektu własnej klasy na początku niewiele mówi:

```python run
class Basket:
    def __init__(self):
        self.items = []


print(Basket())
```

`0x…` to miejsce obiektu w pamięci. Metoda o nazwie `__repr__`, która zwraca napis, mówi Pythonowi, co wypisać zamiast tego. Nazwy z dwoma podkreślnikami po obu stronach są specjalne: Python sam je wywołuje w określonych sytuacjach, więc nigdy nie piszesz `basket.__repr__()`:

```python run
class Basket:
    def __init__(self):
        self.items = []

    def __repr__(self):
        return f"Basket({len(self.items)} items)"


print(Basket())
```

## Metody, które zwracają obiekt

Metoda, która zmienia obiekt, zwykle niczego nie zwraca, więc wywołanie daje `None`. Jeśli kończy się na `return self`, oddaje obiekt z powrotem i kolejne wywołanie może iść od razu dalej, w łańcuchu:

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

Pierwsze `add` oddaje koszyk, a `.add("cake")` działa właśnie na nim. Bez `return self` drugie wywołanie byłoby wywołaniem `None.add(...)`, co kończy się błędem `AttributeError`.

## Podklasy

**Podklasa** to klasa zbudowana na innej klasie. Nazwę klasy bazowej podaje się w nawiasach po nazwie podklasy, a podklasa ma wszystko, co ma klasa bazowa:

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

`GiftBasket` nie ma żadnego własnego kodu, a i tak robi to samo co `Basket`. `isinstance()` mówi, czy obiekt należy do danej klasy albo jej podklasy.

Podklasa zmienia to, czego potrzebuje, pisząc metodę o tej samej nazwie, która **nadpisuje** pierwotną. Własne przygotowanie obiektu trafia do jej własnego `__init__`, a `super()` sięga do klasy bazowej, więc podklasa może najpierw pozwolić tamtej klasie przygotować obiekt, a potem dołożyć swoje:

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

Produkty to pary zapisane w nawiasach jako `(name, price)`: **krotka** (ang. tuple) to krótka lista wartości, której nie można później zmienić, a `for name, price in self.items` rozkłada każdą parę na części, tak jak `for name, age in ages.items()` w przypadku słownika.

`super().__init__()` uruchamia `__init__` klasy `Basket`, które daje `sale` listę produktów. Bez tego `SaleBasket` nigdy jej nie utworzy i pierwsze `add` zakończy się błędem `AttributeError`. W `total()` wywołanie `super().total()` zwraca sumę policzoną tak, jak liczy ją `Basket`, czyli 10, a `SaleBasket` odejmuje od niej 20 procent: wychodzi 8.

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

`fare` to obiekt, który pamięta `w` i `b`, a `fare(4)` to opłata za 4 km przy tych wartościach. Obiekty wywoływane w ten sposób są w PyTorchu wszędzie: `model(x)` uruchamia model na wejściu, a `__call__` robi to, wywołując metodę o nazwie `forward`. Model to podklasa klasy, która dostarcza `__call__`, i pisze własne `forward`:

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

`Line` nie ma `__call__`, a `fare(4)` i tak działa, bo ma je `Module`, a `Line` jest jego podklasą. Tak samo działają `nn.Module` z PyTorcha i twoje własne modele, tylko `Module` ma w sobie dużo więcej, a taką podklasę napiszesz w rozdziale o PyTorchu.

## Twoja kolej

W ćwiczeniu [Koszyk zakupowy](../../../exercises/02-python/04-programs/01-classes/01-shopping-basket/task.pl.md) połączysz to wszystko: napiszesz `Basket`, który przechowuje dodane do niego produkty, sumuje je i potrafi się wypisać, oraz `DiscountBasket`, czyli `Basket` z procentową zniżką od sumy. Pamiętaj o `return self` na końcu `add()` i daj każdemu koszykowi własną listę.
