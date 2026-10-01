---
description: Podaj podpowiedzi do próby w grze w słowa i zawężaj nimi listę słów.
input: "2\nspeed G-GG-\nsweet G-GGY"
---

# Podpowiedzi do słów

*Korzysta z lekcji [Pętle i słowniki](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.pl.md), ze względu na liczenie w słowniku, [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md), ze względu na listy i `range()`, [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), ze względu na `read()` i `split()`, oraz [Listy list](../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md), ze względu na `"".join()` i `raise`.*

W grze w słowa gracz próbuje odgadnąć tajne słowo. Po każdej próbie gra daje podpowiedź dla każdej litery próby: `G`, jeśli tajne słowo ma tę samą literę w tym samym miejscu, `Y`, jeśli litera jest w tajnym słowie, ale w innym miejscu, i `-`, jeśli w ogóle jej w nim nie ma.

Litera tajnego słowa może dać tylko jedną podpowiedź. Najpierw litery na właściwych miejscach dostają swoje `G` i te litery tajnego słowa są zużyte. Potem, od lewej do prawej, litera na złym miejscu dostaje `Y`, jeśli tajne słowo ma jeszcze niezużytą kopię tej litery, którą to `Y` zużywa, a `-`, jeśli nie ma.

Na przykład tajne słowo `crane` i próba `eerie` dają `--Y-G`. Ostatnie `e` jest na właściwym miejscu, co zużywa jedyne `e` w `crane`, więc pozostałe dwa nie dostają nic, a `r` jest w `crane`, ale w innym miejscu.

Napisz dwie funkcje:

- `clues(secret, guess)` zwraca podpowiedzi do próby jako tekst ze znakiem dla każdej litery próby. Gdy te dwa słowa nie mają tej samej długości, zgłasza `ValueError`.
- `possible_words(words, guess, pattern)` zwraca te słowa z listy, które dałyby `pattern` jako podpowiedzi do `guess`, gdyby któreś z nich było tajnym słowem, w takiej kolejności, w jakiej są na liście. Słowo, które nie jest tak długie jak próba, nie może być tajnym słowem, więc jest pomijane.

| Wywołanie                                                     | Zwraca               |
| ------------------------------------------------------------- | -------------------- |
| `clues("crane", "crane")`                                     | `'GGGGG'`            |
| `clues("crane", "slate")`                                     | `'--G-G'`            |
| `clues("apple", "paper")`                                     | `'YYGY-'`            |
| `clues("crane", "eerie")`                                     | `'--Y-G'`            |
| `clues("crane", "cat")`                                       | zgłasza `ValueError` |
| `possible_words(["crane", "trace", "cat"], "slate", "--G-G")` | `['crane']`          |

Program pod funkcjami czyta listę słów z `words.txt`, potem liczbę prób, a dla każdej z nich próbę i podpowiedzi, które dostała, ze spacją między nimi. Zawęża listę próba po próbie i wypisuje słowa, które zostały, albo `No word fits`, jeśli nie został żaden. Powyższe wejście, czyli `speed` z `G-GG-`, a potem `sweet` z `G-GGY`, zostawia jedno słowo:

```text
steel
```

To najtrudniejsze zadanie w zeszycie ćwiczeń, więc oto jeden ze sposobów, jak zabrać się do `clues`:

1. Zacznij od listy, która ma `"-"` dla każdej litery próby. Zmienisz miejsca, które dostają `G` albo `Y`.
2. Przejdź raz przez miejsca. Tam, gdzie oba słowa mają tę samą literę, zmień to miejsce na liście na `"G"`. Tam, gdzie nie mają, litera tajnego słowa jest jeszcze niezużyta, więc policz ją w słowniku, tak jak liczy się samogłoski w lekcji [Pętle i słowniki](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.pl.md).
3. Przejdź przez miejsca jeszcze raz. Miejsce, które nie dostało `G`, zamienia się w `"Y"`, gdy słownik ma jego literę z liczbą większą od 0, a wtedy ta liczba maleje o 1.
4. `"".join()` zamienia listę w tekst do zwrócenia.
