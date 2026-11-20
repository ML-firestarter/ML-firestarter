---
description: Napisz ladę, czyli program, który czyta z klawiatury polecenia takie jak borrow i return, odpowiada na nie i zgłasza błędy, nie przerywając pracy.
---

# Lada

*Korzysta z lekcji [Wyjątki](../../../../../notes/02-python/03-errors-and-testing/01-exceptions.pl.md), z której przyda się obsługa błędów, z lekcji [Warunki i funkcje](../../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md), z której przydadzą się `input()` i podejmowanie decyzji, oraz z lekcji [Klasy](../../../../../notes/02-python/04-programs/01-classes.pl.md), z której przyda się biblioteka.*

Ostatnia część wypożyczalni: program, w którym bibliotekarz wpisuje polecenia. W kodzie jest już cała klasa `Library` i początek funkcji `desk(library)`, która pyta o polecenie, wyświetlając znak zachęty `> `, a po `quit` wypisuje `Goodbye` i kończy pracę. Program pod nią wczytuje `books.json` i wywołuje `desk`. Dokończ `desk` tak, żeby odpowiadała na poniższe polecenia, wpisane w dowolnej mieszance wielkich i małych liter. Każda odpowiedź to jedna linijka albo kilka, wypisane pod poleceniem:

| Polecenie             | Co wypisuje                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `list`                | linijkę dla każdej książki, w kolejności alfabetycznej tytułów: `Dune (1/2)`, czyli ile egzemplarzy z posiadanych stoi na półce |
| `borrow TITLE MEMBER` | `bob borrowed Dune (0 left)`, z właściwym tytułem książki i liczbą pozostałych egzemplarzy                                      |
| `return TITLE MEMBER` | `ann returned Dune`                                                                                                             |
| `who MEMBER`          | tytuły, które ma czytelnik, alfabetycznie i rozdzielone przecinkami, albo `nothing`                                             |
| `quit`                | `Goodbye`, po czym program się kończy                                                                                           |

Tytuł w `borrow` i `return` może zawierać spacje, jak w `borrow pride and prejudice cy`: czytelnik to **ostatnie** słowo, a tytuł to słowa pomiędzy. Poniższe sytuacje nie zatrzymują programu, a każda wypisuje jedną linijkę:

- polecenie, którego nie ma w tabeli: `Error: unknown command: fly`
- `borrow` albo `return` z mniej niż trzema słowami: `Error: usage: borrow TITLE MEMBER` (dla `return` z `return`), a `who` bez dokładnie jednego imienia: `Error: usage: who MEMBER`
- wszystko, czego odmówi biblioteka: `Error: ` i komunikat `LibraryError`, na przykład `Error: no copies left: Dune`

Pusta linijka jest pomijana i nic nie wypisuje. Gdy skończy się wejście, program kończy pracę bez słowa.

```text
> borrow dune bob
bob borrowed Dune (0 left)
> borrow dune cy
Error: no copies left: Dune
> quit
Goodbye
```

Testy wpisują polecenia do twojego programu i porównują wszystko, co wypisze, razem ze znakami zachęty, z tym, co powinien wypisać.

> [!TIP]
> Trzymaj właściwą pracę poza pętlą: funkcję `run_command(library, line)`, która zwraca tekst do wypisania albo zgłasza `LibraryError`, łatwo się czyta, a pętla tylko wczytuje linijkę, wywołuje ją w `try` i wypisuje wynik. `line.split()` daje słowa, a `words[-1]` ostatnie z nich.
