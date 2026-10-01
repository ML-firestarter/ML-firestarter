---
description: Znajdź w pliku słowa złożone z tych samych liter, jak "evil" i "live".
---

# Grupy anagramów

*Korzysta z lekcji [Pętle i słowniki](../../../../notes/02-python/01-basics/02-loops-and-dictionaries.pl.md), [Odczyt i zapis plików](../../../../notes/02-python/01-basics/04-files.pl.md), ze względu na słowniki list i `sorted()`, oraz [Listy list](../../../../notes/02-python/01-basics/05-lists-of-lists.pl.md), ze względu na `"".join()`.*

Dwa słowa są anagramami, gdy jedno powstaje z przestawienia liter drugiego, jak `evil` i `live`. Ułóż litery obu w kolejności alfabetycznej, a dostaniesz te same litery, `eilv`, bez względu na to, od czego słowo zaczynało. Dlatego uporządkowane litery to dobry klucz do grupowania anagramów.

Napisz trzy funkcje:

- `signature(word)` zwraca litery `word` w kolejności alfabetycznej, małymi literami: `signature("Evil")` to `'eilv'`.
- `group_anagrams(words)` bierze listę słów i zwraca słownik z grupami anagramów, które w niej są. Każda grupa to lista pod swoją sygnaturą, ze słowami w takiej kolejności, w jakiej są w `words`, zapisanymi tak, jak je podano. Słowo, które nie ma w liście anagramu, nie tworzy grupy.
- `read_words(path)` zwraca słowa z pliku w `path` jako listę. Plik ma słowo w każdym wierszu i tu i ówdzie pusty wiersz, który się nie liczy.

| Wywołanie                                           | Zwraca                               |
| --------------------------------------------------- | ------------------------------------ |
| `signature("Evil")`                                 | `'eilv'`                             |
| `group_anagrams(["evil", "tulip", "vile", "live"])` | `{'eilv': ['evil', 'vile', 'live']}` |
| `group_anagrams(["tulip", "kayak"])`                | `{}`                                 |

Program pod funkcjami wczytuje `words.txt` i wypisuje wiersz dla każdej grupy: jej sygnaturę, dwukropek i jej słowa. Grupy idą w kolejności alfabetycznej sygnatur. Gdy twoje funkcje działają, pierwsze wiersze wyniku to:

```text
aegln: angle, glean, angel
aelst: stale, slate, least, steal
below: below, elbow, bowel
```

> [!TIP]
> `sorted()` układa w kolejności także litery napisu: `sorted("evil")` to `['e', 'i', 'l', 'v']`. `"".join()` tej listy znów tworzy napis.
