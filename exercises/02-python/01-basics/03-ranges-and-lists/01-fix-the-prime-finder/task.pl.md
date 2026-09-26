---
description: Znajdź trzy pomyłki, przez które program daje złe wyniki, choć się nie zatrzymuje.
input: "10\n20"
---

# Popraw wyszukiwarkę liczb pierwszych

Liczba pierwsza to liczba całkowita większa od 1, która dzieli się bez reszty tylko przez 1 i przez samą siebie, na przykład 2, 3, 5, 7 i 11. Ten program wczytuje dwie liczby i wypisuje liczby pierwsze od pierwszej do drugiej, łącznie z nimi. Z `10` i `20` w polu **Wejście** powinien wypisać:

```text
10
20
11, 13, 17, 19
```

Działa bez błędu, ale przez trzy pomyłki daje złe wyniki: dwie są w `is_prime`, a jedna w `primes_between`. Naciśnij **Sprawdź** i przeczytaj, które sprawdzenia nie przechodzą: każde pokazuje wywołanie, to, co zwróciło, i to, co powinno było zwrócić, a to mówi, gdzie szukać. Każda pomyłka wymaga drobnej zmiany w jednym wierszu, więc nie trzeba pisać funkcji od nowa.
