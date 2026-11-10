---
description: Znajdź nachylenie straty względem kursu, nie ruszając parametrów modelu, i przesuń kurs tak, żeby strata wzrosła.
---

# Przesuń wejście

Część [Nachylenie względem wejścia](../../../../notes/05-pytorch/02-autograd.pl.md#nachylenie-względem-wejścia) ustaliła, w którą stronę musi przesunąć się kurs, żeby strata wzrosła, nie ruszając cen. Dokończ dwie funkcje, które robią to dla dowolnych cen i dowolnego kursu:

- `input_slope(prices, start, ride, fare)` zwraca nachylenie błędu do kwadratu, `(ride @ prices + start - fare) ** 2`, względem kursu: tensor z nachyleniem dla każdej liczby kursu.
- `nudge(prices, start, ride, fare, step)` zwraca nowy kurs: `ride`, w którym każda liczba jest przesunięta o `step` w kierunku znaku swojego nachylenia. To ta mała zmiana, która najbardziej podnosi stratę. Może wywołać `input_slope`.

`prices` i `start` to parametry modelu, więc przychodzą oznaczone, z `requires_grad=True`. `ride` to dane: zwykły tensor. Obie funkcje zostawiają wszystkie trzy tak, jak je zastały: nic nowego w `.grad` parametrów i żadnego oznaczenia na `ride`.

| Wywołanie, z cenami `[3.0, 0.5]`, startem `8.0` i kursem `[4.0, 6.0]` | Zwraca                     |
| --------------------------------------------------------------------- | -------------------------- |
| `input_slope(prices, start, ride, 30.0)`                              | `tensor([-42., -7.])`      |
| `input_slope(prices, start, ride, 20.0)`                              | `tensor([18., 3.])`        |
| `nudge(prices, start, ride, 30.0, 0.1)`                               | `tensor([3.9000, 5.9000])` |
| `nudge(prices, start, ride, 20.0, 0.1)`                               | `tensor([4.1000, 6.1000])` |
| `nudge(prices, start, ride, 23.0, 0.1)`                               | `tensor([4., 6.])`         |

Ceny dają dla tego kursu 23. Paragon na 30 znaczy, że predykcja jest za niska, więc krótszy kurs powiększa pomyłkę, a paragon na 20, że jest za wysoka, więc powiększa ją dłuższy. Przy paragonie na 23 predykcja jest dokładna: nachylenia to 0, ich znak to 0 i kurs zostaje tam, gdzie był.

Jedno sprawdzenie patrzy na to, co zostało po wywołaniu, jako `[slope, prices.grad, start.grad, prices.requires_grad, ride.requires_grad]`, i powinno to być `[[-42.0, -7.0], None, None, True, False]`. Jeśli tam, gdzie powinny być dwa `None`, są tensory, nachylenia policzyło `backward()`, które wypełnia `.grad` wszystkiego, co jest oznaczone: `torch.autograd.grad` zwraca tylko to nachylenie, o które je zapytano. Jeśli `ride.requires_grad` to `True`, funkcja oznaczyła tensor, który dostała, a nie jego kopię: `ride.clone()` to własna kopia. A jeśli `prices.requires_grad` to `False`, funkcja zamroziła ceny, które dostała, i ich właściciel nie może ich już trenować.
