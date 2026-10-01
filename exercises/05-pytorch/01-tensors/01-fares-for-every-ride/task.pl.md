---
description: Policz opłatę za każdy kurs z tabeli i utarg całego dnia samą arytmetyką na tensorach, bez pętli.
---

# Opłaty za każdy kurs

W części [Mnożenie macierzy](../../../../notes/05-pytorch/01-tensors.pl.md#mnożenie-macierzy) tabela razy wektor dała opłaty czterech kursów naraz. Dokończ dwie funkcje, które robią to dla dowolnego dnia:

- `fares(rides, prices, start)` zwraca tensor z opłatą za każdy kurs. `rides` to tabela z wierszem dla każdego kursu i kolumną dla każdej informacji o nim, jak odległość i minuty postoju. `prices` to tensor z ceną jednej jednostki każdej kolumny, a `start` to opłata za rozpoczęcie kursu. Opłata za kurs to każda jego liczba razy cena jej kolumny, zsumowane, plus `start`.
- `takings(rides, prices, start)` zwraca utarg dnia: wszystkie opłaty zsumowane, jako zwykła liczba Pythona, a nie tensor.

`DAY` zawiera cztery kursy z lekcji, a `PRICES` ceny kilometra i minuty postoju.

| Wywołanie                 | Zwraca                         |
| ------------------------- | ------------------------------ |
| `fares(DAY, PRICES, 8)`   | `tensor([15., 23., 29., 33.])` |
| `fares(DAY, PRICES, 0)`   | `tensor([ 7., 15., 21., 25.])` |
| `takings(DAY, PRICES, 8)` | `100.0`                        |

Testy używają też tabel z inną liczbą kursów i kolumn, więc nie wpisuj do kodu 2 ani 4. Jeśli `fares` zgłasza `RuntimeError` z napisem „size mismatch”, kształty tabeli i cen do siebie nie pasują, jak w lekcji. Jeśli testy mówią, że `takings` dało `tensor(100.)`, a miało dać `100.0`, potrzebna jest liczba z wnętrza tensora: poszukaj `.item()`.
