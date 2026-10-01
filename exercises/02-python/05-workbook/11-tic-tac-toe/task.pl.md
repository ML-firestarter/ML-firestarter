---
description: Rozegraj partię kółka i krzyżyka z pliku z ruchami i powiedz, jak się skończyła.
---

# Kółko i krzyżyk

*Korzysta z lekcji [Listy list](../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md), ze względu na listy w listach, wycinki i `raise`, [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), ze względu na czytanie pliku i `split()`, oraz [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md), ze względu na wychodzenie z funkcji w pętli.*

Plansza do kółka i krzyżyka to lista trzech wierszy, a każdy wiersz to lista trzech pól: `"X"`, `"O"` albo `"."` dla pola, które jest puste. Wiersze i kolumny liczymy od 0. W edytorze jest `new_board()`, które zwraca pustą planszę. Napisz cztery funkcje:

- `place(board, row, col, mark)` zwraca nową planszę ze znakiem `mark` w polu o numerach `row` i `col`, a planszę, którą dostała, zostawia taką, jaka była. Zgłasza `ValueError`, gdy pola nie ma na planszy, bo któryś numer jest za duży albo ujemny, gdy pole jest zajęte i gdy `mark` to nie `"X"` ani `"O"`, nawet jeśli to mały `x`.
- `winner(board)` zwraca `"X"` albo `"O"`, gdy ten znak wypełnia wiersz, kolumnę albo jedną z dwóch przekątnych, a `None`, gdy nikt nie wygrał. Linia pustych pól nie wygrywa.
- `result(board)` zwraca `"X wins"` albo `"O wins"`, gdy jest zwycięzca, `"Draw"`, gdy plansza jest pełna i nikt nie wygrał, a w każdym innym przypadku `"Game not finished"`.
- `play(path)` czyta partię z pliku w `path`, z jednym ruchem w wierszu, jak `X 1 1` dla znaku, jego wiersza i jego kolumny, i zwraca planszę po ruchach. Kończy, gdy tylko ktoś wygra, a ruchy po tym są pomijane. Gdy `place` nie dopuszcza jakiegoś ruchu, jego `ValueError` wychodzi też z `play`.

| Wywołanie                                                     | Zwraca                                                |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| `place(new_board(), 1, 1, "X")`                               | `[['.', '.', '.'], ['.', 'X', '.'], ['.', '.', '.']]` |
| `place(new_board(), 3, 0, "X")`                               | zgłasza `ValueError`                                  |
| `winner([['X', 'X', 'X'], ['O', 'O', '.'], ['.', '.', '.']])` | `'X'`                                                 |
| `winner(new_board())`                                         | `None`                                                |
| `result(new_board())`                                         | `'Game not finished'`                                 |

Program pod funkcjami rozgrywa partię z `game.txt`, wypisuje planszę ze spacją między polami, a potem wynik. Gdy twoje funkcje działają, wypisuje:

```text
O . X
O X .
O . X
O wins
```

Sprawdzenia rozgrywają jeszcze kilka partii z innych plików, więc `play` musi działać dla każdego pliku, nie tylko dla `game.txt`.

To jedno z najtrudniejszych zadań w zeszycie ćwiczeń, więc oto jeden ze sposobów, jak się do niego zabrać:

1. Żeby znaleźć zwycięzcę, zbierz osiem linii planszy jako listy trzech pól: trzy wiersze, trzy kolumny i dwie przekątne. Linia wygrywa, gdy jej pierwsze pole to nie `"."`, a pozostałe dwa pola są takie same jak pierwsze.
2. Żeby skopiować planszę, nie dzieląc jej wierszy ze starą, skopiuj każdy wiersz: `[line[:] for line in board]`. Postaw znak w kopii.
3. W `play` utwórz planszę przez `new_board()`, a potem przejdź przez wiersze pliku. Każdy ruch postaw na planszy przez `place` i zwróć planszę przez `return`, gdy tylko `winner` znajdzie zwycięzcę. Jeśli nikt nie wygrał, odpowiedzią jest plansza po ostatnim wierszu.
