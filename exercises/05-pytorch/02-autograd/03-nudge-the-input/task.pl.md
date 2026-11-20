---
description: Policz nachylenie straty względem kursu, nie ruszając parametrów modelu, i przesuń kurs tak, żeby strata wzrosła.
---

# Przesuń wejście

W części [Nachylenie względem wejścia](../../../../notes/05-pytorch/02-autograd.pl.md#nachylenie-względem-wejścia) okazało się, w którą stronę trzeba przesunąć kurs, żeby strata wzrosła, choć ceny się nie zmieniają. Dokończ dwie funkcje, które robią to dla dowolnych cen i dowolnego kursu:

- `input_slope(prices, start, ride, fare)` zwraca nachylenie kwadratu błędu, `(ride @ prices + start - fare) ** 2`, względem kursu: tensor z nachyleniem dla każdej liczby kursu.
- `nudge(prices, start, ride, fare, step)` zwraca nowy kurs: `ride`, w którym każda liczba jest przesunięta o `step` w stronę znaku swojego nachylenia. To ta niewielka zmiana, która najbardziej zwiększa stratę. Funkcja może wywołać `input_slope`.

`prices` i `start` to parametry modelu, więc przychodzą oznaczone, z `requires_grad=True`. `ride` to dane, czyli zwykły tensor. Obie funkcje zostawiają wszystkie trzy w takim stanie, w jakim je dostały: nic nowego w `.grad` parametrów i żadnego oznaczenia na `ride`.

| Wywołanie z cenami `[3.0, 0.5]`, startem `8.0` i kursem `[4.0, 6.0]` | Zwraca                     |
| -------------------------------------------------------------------- | -------------------------- |
| `input_slope(prices, start, ride, 30.0)`                             | `tensor([-42., -7.])`      |
| `input_slope(prices, start, ride, 20.0)`                             | `tensor([18., 3.])`        |
| `nudge(prices, start, ride, 30.0, 0.1)`                              | `tensor([3.9000, 5.9000])` |
| `nudge(prices, start, ride, 20.0, 0.1)`                              | `tensor([4.1000, 6.1000])` |
| `nudge(prices, start, ride, 23.0, 0.1)`                              | `tensor([4., 6.])`         |

Dla tego kursu ceny dają 23 zł. Paragon na 30 zł oznacza, że predykcja jest za niska, więc pomyłkę zwiększa krótszy kurs, a paragon na 20 zł, że jest za wysoka, więc zwiększa ją dłuższy. Przy paragonie na 23 zł predykcja jest dokładna: nachylenia wynoszą 0, ich znaki też, i kurs zostaje bez zmian.

Jedno sprawdzenie bada, co zostało po wywołaniu, jako `[slope, prices.grad, start.grad, prices.requires_grad, ride.requires_grad]`. Powinno to być `[[-42.0, -7.0], None, None, True, False]`. Jeśli zamiast dwóch `None` są tensory, nachylenia policzyło `backward()`, które wypełnia `.grad` wszystkiego, co jest oznaczone, a `torch.autograd.grad` zwraca tylko to nachylenie, o które się je poprosi. Jeśli `ride.requires_grad` to `True`, funkcja oznaczyła tensor, który dostała, zamiast jego kopii: osobną kopię tworzy `ride.clone()`. A jeśli `prices.requires_grad` to `False`, funkcja zamroziła ceny, które dostała, i ich właściciel nie może ich już trenować.
