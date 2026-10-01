---
description: Skracaj ułamki, dodawaj je i zapisuj wynik jako liczbę mieszaną.
input: "3/4\n5/6"
---

# Ułamki

*Korzysta z lekcji [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md), ze względu na `range()`, `//` i `%`, [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), ze względu na `split()`, oraz [Listy list](../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md), ze względu na `raise`.*

Trzy czwarte jest w edytorze zapisane jako lista dwóch liczb, `[3, 4]`: licznika i mianownika. Napisz cztery funkcje, które działają na takich ułamkach:

- `gcd(a, b)` zwraca największy wspólny dzielnik dwóch liczb całkowitych, które są równe co najmniej 1: największą liczbę, która dzieli `a` i `b` bez reszty. `gcd(12, 18)` to `6`.
- `simplify(top, bottom)` zwraca ułamek w najprostszej postaci, jako listę `[top, bottom]`, z mianownikiem, który zawsze jest dodatni: gdy ułamek jest ujemny, minus stoi przy liczniku. Zero to `[0, 1]`. Mianownik równy 0 zgłasza `ValueError`.
- `add(first, second)` bierze dwa ułamki, każdy jako lista `[top, bottom]` z mianownikiem różnym od 0, i zwraca ich sumę w najprostszej postaci.
- `to_text(fraction)` zapisuje ułamek jako tekst, w najprostszej postaci. Ułamek większy od 1 staje się liczbą mieszaną, czyli częścią całkowitą, a po niej tym, co zostaje, jak `1 1/2`, a ułamek, który wychodzi całkowity, to po prostu ta liczba, jak `2`. Przy ujemnym ułamku minus jest na początku, jak `-1 1/2`.

| Wywołanie             | Zwraca               |
| --------------------- | -------------------- |
| `gcd(12, 18)`         | `6`                  |
| `simplify(6, 8)`      | `[3, 4]`             |
| `simplify(6, -8)`     | `[-3, 4]`            |
| `simplify(0, 5)`      | `[0, 1]`             |
| `simplify(1, 0)`      | zgłasza `ValueError` |
| `add([1, 2], [1, 3])` | `[5, 6]`             |
| `add([1, 4], [3, 4])` | `[1, 1]`             |
| `to_text([5, 6])`     | `'5/6'`              |
| `to_text([7, 2])`     | `'3 1/2'`            |
| `to_text([-7, 2])`    | `'-3 1/2'`           |
| `to_text([6, 3])`     | `'2'`                |

Program pod funkcjami czyta dwa ułamki, każdy w osobnym wierszu i zapisany z ukośnikiem, jak `3/4`, i wypisuje ich sumę. Gdy twoje funkcje działają, wejście `3/4` i `5/6` daje:

```text
3/4 + 5/6 = 1 7/12
```

> [!TIP]
> `//` i `%` zaokrąglają w dół, więc `-7 // 2` to `-4`, a `-7 % 2` to `1`. Przy ujemnym liczniku zdejmij minus, zanim rozdzielisz go na część całkowitą i resztę, a na końcu postaw go z powrotem przed tekstem.
