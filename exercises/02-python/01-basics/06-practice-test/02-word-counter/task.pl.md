---
description: Policz, ile razy każde słowo występuje w tekście, i znajdź najczęstsze.
---

# Licznik słów

*Korzysta z lekcji [Pętle i słowniki](../../../../../notes/02-python/01-basics/02-loops-and-dictionaries.pl.md) oraz, ze względu na `split()`, [Odczyt i zapis plików](../../../../../notes/02-python/01-basics/04-files.pl.md).*

Napisz dwie funkcje:

- `count_words(text)` zwraca słownik z każdym słowem z `text` i liczbą jego wystąpień. Wielkość liter nie ma znaczenia: `The` i `the` to to samo słowo, które słownik zapisuje małymi literami. Słowa są rozdzielone spacjami, a w tekstach nie ma znaków interpunkcyjnych.
- `most_common(text)` zwraca słowo, które występuje w `text` najczęściej, zapisane małymi literami. Gdy kilka słów występuje równie często, to to z nich, które pojawia się w tekście najwcześniej.

| Wywołanie                                | Zwraca                                     |
| ---------------------------------------- | ------------------------------------------ |
| `count_words("the cat and the hat")`     | `{'the': 2, 'cat': 1, 'and': 1, 'hat': 1}` |
| `count_words("Yes yes YES")`             | `{'yes': 3}`                               |
| `most_common("The cat and the hat")`     | `'the'`                                    |
| `most_common("one two two three three")` | `'two'`                                    |
