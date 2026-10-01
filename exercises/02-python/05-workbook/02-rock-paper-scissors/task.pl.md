---
description: Sędziuj w grze w papier, kamień, nożyce, rundę po rundzie i w całym meczu.
input: "rock\nscissors"
---

# Papier, kamień, nożyce

*Korzysta z lekcji [Warunki i funkcje](../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md), [Pętle i słowniki](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.pl.md) oraz, ze względu na `raise`, [Listy list](../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md).*

W grze w papier, kamień, nożyce dwóch graczy wybiera w tej samej chwili jeden ruch: kamień (`rock`) wygrywa z nożycami (`scissors`), nożyce wygrywają z papierem (`paper`), a papier wygrywa z kamieniem. Dwa takie same ruchy dają remis. W edytorze jest słownik `BEATS`, który mówi, z którym ruchem każdy z nich wygrywa: `BEATS["rock"]` to `"scissors"`.

Napisz dwie funkcje:

- `round_winner(first, second)` bierze ruchy obu graczy i zwraca `"first"`, gdy rundę wygrywa pierwszy gracz, `"second"`, gdy wygrywa drugi, i `"draw"`, gdy jest remis. Wielkość liter nie ma znaczenia: `Rock` to `rock`. Ruch, który nie jest kamieniem, papierem ani nożycami, zgłasza `ValueError`.
- `score(first_moves, second_moves)` bierze ruchy całego meczu, po jednej liście dla każdego gracza, i zwraca słownik z liczbą rund wygranych przez pierwszego gracza, wygranych przez drugiego i remisów, pod kluczami `"first"`, `"second"` i `"draw"`. Zawsze ma wszystkie trzy klucze. Gdy listy mają różną długość, zgłasza `ValueError`.

| Wywołanie                                         | Zwraca                                 |
| ------------------------------------------------- | -------------------------------------- |
| `round_winner("rock", "scissors")`                | `'first'`                              |
| `round_winner("rock", "paper")`                   | `'second'`                             |
| `round_winner("Paper", "paper")`                  | `'draw'`                               |
| `round_winner("rock", "lizard")`                  | zgłasza `ValueError`                   |
| `score(["rock", "paper"], ["scissors", "paper"])` | `{'first': 1, 'second': 0, 'draw': 1}` |

Program pod funkcjami wczytuje ruchy obu graczy z pola **Wejście**, po jednym w wierszu, i wypisuje `Player 1 wins`, `Player 2 wins` albo `Draw`. Z `rock` i `scissors` w polu wypisuje:

```text
rock
scissors
Player 1 wins
```
