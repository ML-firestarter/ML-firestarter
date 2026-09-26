---
description: Sprawdź, czy wpisany wiek oznacza pełnoletność.
input: 20
---

# Czy to już pełnoletność?

Pełnoletność zaczyna się w dniu 18. urodzin. Dokończ funkcję `is_adult(age)`: dostaje wiek w pełnych latach i zwraca `True`, gdy to 18 lub więcej, a w przeciwnym razie `False`.

| Wywołanie      | Zwraca  |
| -------------- | ------- |
| `is_adult(18)` | `True`  |
| `is_adult(17)` | `False` |
| `is_adult(42)` | `True`  |

Pod funkcją program wczytuje wiek z pola **Wejście** i wypisuje, co mówi o nim `is_adult`. Program ma też własny błąd, który wyjdzie na jaw, gdy `is_adult` zacznie porównywać wiek z 18: `input()` zwraca tekst, a Python nie porówna tekstu z liczbą. Popraw go, żeby z `20` w polu **Wejście** program wypisywał:

```text
20
True
```

Pierwszy wiersz to wpisany wiek: strona pokazuje każdy wiersz, który wczytuje `input()`, tak jak zrobiłby to terminal.
