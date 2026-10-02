---
description: Classes with their own data and methods, printing and chaining, subclasses and objects you can call, for a shopping basket.
---

# Classes

A shop's basket holds items, and it can tell you what they come to. A **class** is how Python bundles things like that: the data an object keeps, here the items, and the functions that work on it, here adding an item and adding up the total. You've used objects of other people's classes all along: a string knows how to `upper()` itself, and a list how to `append()`.

In this lesson's exercise, you'll write two classes: a basket, and a discount basket that builds on it. You'll need:

- **classes**, **attributes** and **methods**, with `__init__` and `self`,
- `__repr__`, which says how an object prints,
- a method that returns the object itself, so that calls can be chained,
- **subclasses**, which take what a class has and change some of it, with `super()`,
- `__call__`, which makes an object callable like a function.

> [!NOTE]
> This is also the way into PyTorch. A PyTorch model is a class, written in just the way this lesson shows: it's a subclass of `nn.Module`, it sets up its layers in `__init__` after calling `super().__init__()`, and it's called like a function.

## Objects and methods

A string and a list are objects. Each one keeps its own data, the letters or the items, and a method such as `upper()` or `append()` works on that data. A method is called with a dot after the object:

```python run
word = "basket"
items = ["tea"]
print(word.upper())
items.append("cake")
print(items)
```

Two objects of the same kind don't share their data: appending to one list leaves the other as it was.

## A first class

`class` makes a new kind of object. Here's one that counts:

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

`Counter()` makes a new object, and Python calls its `__init__` to set it up. Inside a method, `self` is the object the method was called on, so `self.count = 0` gives the new object an **attribute**, a variable of its own, called `count`. In `tally.up()`, Python passes `tally` as `self`, which is why the call has no arguments and the method has one parameter. Every method starts with `self`.

`tally` and `other` are two objects of one class, each with its own `count`: `tally` was moved to 2, and `other` still has 0.

`__init__` can take more parameters after `self`, and they come from the call:

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

A method is a function, so it can have more parameters, defaults and a `return`.

> [!WARNING]
> Put the list of a basket's items in `__init__`, as `self.items = []`. A list written in the class itself, outside of any method, would be a single list that all of its objects share, and every basket would hold the items of all the others.

## How an object prints

Printing an object of a class of your own isn't helpful at first:

```python run
class Basket:
    def __init__(self):
        self.items = []


print(Basket())
```

The `0x…` is where the object sits in memory. A method named `__repr__` that returns a string tells Python what to print instead. Names with two underscores on both sides are special: Python calls them itself, in certain situations, so you never write `basket.__repr__()`:

```python run
class Basket:
    def __init__(self):
        self.items = []

    def __repr__(self):
        return f"Basket({len(self.items)} items)"


print(Basket())
```

## Methods that return the object

A method that changes an object usually returns nothing, so what you get from a call is `None`. If it ends in `return self`, it gives the object back, and the next call can go straight on, in a chain:

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

The first `add` gives back the basket, and `.add("cake")` works on it. Without `return self`, the second call would be `None.add(...)`, which stops with an `AttributeError`.

## Subclasses

A **subclass** is a class made on top of another one. Its name goes in parentheses after the class name, and it has everything the other class has:

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

`GiftBasket` wrote nothing, and still does what a `Basket` does. `isinstance()` says whether an object is of a class or a subclass of it.

A subclass changes what it needs to by writing a method of the same name, which **overrides** the first. Its own setup goes in its own `__init__`, and `super()` reaches the class above it, so the subclass can first let that class set itself up, and then add its own:

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

The items are pairs written `(name, price)` with parentheses: a **tuple** is a short list of values that can't be changed afterwards, and `for name, price in self.items` takes each pair apart, as `for name, age in ages.items()` does for a dictionary.

`super().__init__()` runs the `__init__` of `Basket`, which gives `sale` its list of items. Leave it out, and `SaleBasket` never makes one: the first `add` stops with an `AttributeError`. In `total()`, `super().total()` is the total as `Basket` works it out, 10, and `SaleBasket` takes 20 percent off it: 8.

## Objects you can call

A method named `__call__` lets an object be called like a function, with parentheses. The call runs `__call__`:

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

`fare` is an object that remembers `w` and `b`, and `fare(4)` is the fare for 4 km with them. Objects that are called like this are everywhere in PyTorch, where `model(x)` runs a model on its input, and `__call__` does it by running a method named `forward`. A model is a subclass of a class that supplies `__call__`, and writes its own `forward`:

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

`Line` has no `__call__`, and `fare(4)` still works, because `Module` has one, and `Line` is a subclass. That's what PyTorch's `nn.Module` and your own models do, with a lot more in `Module`, and you'll write such a subclass in the PyTorch chapter.

## Your turn

In [Shopping basket](../../../exercises/02-python/04-programs/01-classes/01-shopping-basket/task.md), you'll put it all together: a `Basket` that keeps what's added to it, adds it up and prints itself, and a `DiscountBasket` that is a `Basket` with a percentage off its total. Mind the `return self` at the end of `add()`, and give each basket a list of its own.
