---
description: Znajdź trzy pomyłki, przez które krokomierz daje złe wyniki, choć się nie zatrzymuje.
input: "8200 10450 3000 12000 7600"
---

# Popraw krokomierz

*Korzysta z lekcji [Warunki i funkcje](../../../../notes/02-python/01-basics/01-conditions-and-functions.pl.md) oraz [Zakresy i listy](../../../../notes/02-python/01-basics/03-ranges-and-lists.pl.md), a najbardziej z jej części o błędach, które nie zatrzymują programu.*

Ten program wczytuje liczby kroków, które ktoś przeszedł w kolejnych dniach, oddzielone spacjami, i je sumuje. Podaje ich sumę i średnią na dzień, mówi, jaki poziom daje ta średnia, i liczy dni, w których osiągnięto cel 10000 kroków. Poziom to `gold` od 10000 kroków, `silver` od 7000, `bronze` od 4000 i `none` poniżej. Z `8200 10450 3000 12000 7600` w polu **Wejście** powinien wypisać:

```text
8200 10450 3000 12000 7600
Total: 41250
Average: 8250
Level: silver
Days with 10000 steps: 2
```

Działa bez błędu, ale przez trzy pomyłki daje złe wyniki, po jednej w `total_steps`, `level` i `goal_days`. Naciśnij **Sprawdź** i przeczytaj, które sprawdzenia nie przechodzą: każde pokazuje wywołanie, to, co zwróciło, i to, co powinno było zwrócić, a to mówi, gdzie szukać. Każda pomyłka wymaga drobnej zmiany, więc nie trzeba pisać funkcji od nowa.
