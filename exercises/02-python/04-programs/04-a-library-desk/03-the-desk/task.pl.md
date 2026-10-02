---
description: Napisz kontuar, program, który czyta z klawiatury polecenia takie jak borrow i return, odpowiada na nie i zgłasza błędy bez zatrzymywania się.
---

# Kontuar

*Korzysta z lekcji [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md) dla obsługi błędów, [Warunki i funkcje](../../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md) dla `input()` i decyzji oraz [Klasy](../../../../../notes/02-python/04-programs/01-classes.pl.md) dla biblioteki.*

Ostatnia część biblioteki: program, w który bibliotekarz wpisuje polecenia. Kod ma całą `Library` i początek `desk(library)`, który pyta o polecenie ze znakiem zachęty `> ` i zatrzymuje się na `quit`, wypisując `Goodbye`. Program pod nim wczytuje `books.json` i wywołuje `desk`. Dokończ `desk`, żeby odpowiadał na te polecenia, wpisane z dowolną mieszanką wielkich liter. Każda odpowiedź to linia albo kilka, wypisane pod poleceniem:

| Polecenie                | Co wypisuje                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `list`                   | linię dla każdej książki w kolejności alfabetycznej tytułów: `Dune (1/2)`, egzemplarze na półce z posiadanych |
| `borrow TITLE MEMBER`    | `bob borrowed Dune (0 left)`, z własnym tytułem książki i pozostałymi egzemplarzami  |
| `return TITLE MEMBER`    | `ann returned Dune`                                                                 |
| `who MEMBER`             | tytuły, które ma członek, alfabetycznie, rozdzielone przecinkami, albo `nothing`    |
| `quit`                   | `Goodbye` i program się kończy                                                      |

Tytuł w `borrow` i `return` może mieć spacje, jak w `borrow pride and prejudice cy`: członek to **ostatnie** słowo, a tytuł to słowa pomiędzy. Te nie zatrzymują programu i każde wypisuje jedną linię:

- polecenie, które nie jest żadnym z tych: `Error: unknown command: fly`
- `borrow` albo `return` z mniej niż trzema słowami: `Error: usage: borrow TITLE MEMBER` (z `return` dla `return`), a `who` bez dokładnie jednego imienia po nim: `Error: usage: who MEMBER`
- wszystko, czego odmówi biblioteka: `Error: ` i komunikat `LibraryError`, jak `Error: no copies left: Dune`

Linia bez niczego jest ignorowana i nic nie wypisuje. Jeśli skończy się wejście, program kończy się po cichu.

```text
> borrow dune bob
bob borrowed Dune (0 left)
> borrow dune cy
Error: no copies left: Dune
> quit
Goodbye
```

Testy wpisują polecenia do twojego programu i porównują wszystko, co wypisuje, razem ze znakami zachęty, z tym, co powinien.

> [!TIP]
> Trzymaj pracę poza pętlą: funkcja `run_command(library, line)`, która zwraca to, co wypisać, albo zgłasza `LibraryError`, jest łatwa do czytania, a pętla tylko czyta, wywołuje ją w `try` i wypisuje. `line.split()` daje słowa, a `words[-1]` ostatnie.
