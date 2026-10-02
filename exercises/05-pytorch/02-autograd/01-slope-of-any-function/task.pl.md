---
description: Pozwól autogradowi znaleźć nachylenie dowolnej funkcji w punkcie, bez liczenia wzoru.
---

# Nachylenie dowolnej funkcji

W części [Jedna liczba](../../../../notes/05-pytorch/02-autograd.pl.md#jedna-liczba) `backward()` ustaliło, że $x^2$ ma nachylenie 10 w $x = 5$, a wzór $2x$ nie był do tego potrzebny. Dokończ `slope(f, x)`, które w ten sam sposób znajduje nachylenie dowolnej funkcji.

`f` to funkcja, która przyjmuje tensor i zwraca tensor z jedną liczbą, jak `lambda x: x ** 2`. `x` to punkt, w którym szukasz nachylenia: zwykła liczba, całkowita lub nie. `slope` zwraca nachylenie `f` w `x` jako zwykłą liczbę Pythona.

| Wywołanie                                     | Zwraca  |
| --------------------------------------------- | ------- |
| `slope(lambda x: x ** 2, 5.0)`                | `10.0`  |
| `slope(lambda x: 3 * x + 8, 100.0)`           | `3.0`   |
| `slope(lambda x: (3 * x + 8 - 23) ** 2, 4.0)` | `-18.0` |
| `slope(lambda x: x ** 3, 2)`                  | `12.0`  |

Trzecia funkcja to błąd do kwadratu dla kursu na 3 km, który kosztował 23, dla prostej z wyrazem wolnym 8 i wagą `x`. Przy wadze 4 prosta przewiduje 3 × 4 + 8 = 20, czyli o 3 za mało, więc zwiększenie wagi zmniejsza stratę: dlatego nachylenie jest ujemne. Jakakolwiek by była `f`, nie licz jej nachylenia samodzielnie.

Jeśli `slope` zgłasza `RuntimeError` z napisem „Only Tensors of floating point and complex dtype can require gradients”, liczba była całkowita, jak `2` w ostatnim wywołaniu: najpierw zamień ją na zmiennoprzecinkową. Jeśli zwraca `None`, nie wywołano `backward()` albo nachylenie odczytano z niewłaściwego tensora: jest w `.grad` tensora, który ma `requires_grad`.
