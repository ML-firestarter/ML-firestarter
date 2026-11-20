---
description: Niech autograd znajdzie nachylenie dowolnej funkcji w punkcie, bez wyprowadzania wzoru.
---

# Nachylenie dowolnej funkcji

W części [Jedna liczba](../../../../notes/05-pytorch/02-autograd.pl.md#jedna-liczba) `backward()` ustaliło, że $x^2$ ma w punkcie $x = 5$ nachylenie 10, i nie potrzebowało do tego wzoru $2x$. Dokończ funkcję `slope(f, x)`, która w ten sam sposób znajduje nachylenie dowolnej funkcji.

`f` to funkcja, która przyjmuje tensor i zwraca tensor z jedną liczbą, na przykład `lambda x: x ** 2`. `x` to punkt, w którym szukasz nachylenia: zwykła liczba, całkowita albo nie. `slope` zwraca nachylenie `f` w punkcie `x` jako zwykłą liczbę Pythona.

| Wywołanie                                     | Zwraca  |
| --------------------------------------------- | ------- |
| `slope(lambda x: x ** 2, 5.0)`                | `10.0`  |
| `slope(lambda x: 3 * x + 8, 100.0)`           | `3.0`   |
| `slope(lambda x: (3 * x + 8 - 23) ** 2, 4.0)` | `-18.0` |
| `slope(lambda x: x ** 3, 2)`                  | `12.0`  |

Trzecia funkcja to kwadrat błędu dla kursu na 3 km, który kosztował 23 zł, i prostej z wyrazem wolnym 8 i wagą `x`. Przy wadze 4 prosta przewiduje 3 × 4 + 8 = 20, czyli o 3 za mało, więc zwiększenie wagi zmniejsza stratę: dlatego nachylenie jest ujemne. Jakakolwiek jest `f`, nie licz jej nachylenia samodzielnie.

Jeśli `slope` zgłasza `RuntimeError` z komunikatem „Only Tensors of floating point and complex dtype can require gradients”, liczba była całkowita, jak `2` w ostatnim wywołaniu: najpierw zamień ją na zmiennoprzecinkową. Jeśli funkcja zwraca `None`, nie wywołano `backward()` albo nachylenie zostało odczytane z niewłaściwego tensora: jest ono w `.grad` tensora, który ma `requires_grad`.
