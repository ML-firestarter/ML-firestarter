---
description: Policz opłatę za każdy kurs z tabeli i utarg z całego dnia samymi działaniami na tensorach, bez pętli.
---

# Opłaty za każdy kurs

W części [Mnożenie macierzy](../../../../notes/05-pytorch/01-tensors.pl.md#mnożenie-macierzy) tabela pomnożona przez wektor dała opłaty za cztery kursy naraz. Dokończ dwie funkcje, które robią to samo dla dowolnego dnia:

- `fares(rides, prices, start)` zwraca tensor z opłatą za każdy kurs. `rides` to tabela z wierszem dla każdego kursu i kolumną dla każdej jego cechy, takiej jak odległość czy minuty postoju. `prices` to tensor z ceną jednostki z każdej kolumny, a `start` to opłata za rozpoczęcie kursu. Opłata za kurs to suma iloczynów jego liczb i cen ich kolumn, powiększona o `start`.
- `takings(rides, prices, start)` zwraca utarg z całego dnia, czyli sumę wszystkich opłat, jako zwykłą liczbę Pythona, a nie tensor.

`DAY` zawiera cztery kursy dzienne z lekcji, a `PRICES` ceny kilometra i minuty postoju.

| Wywołanie                 | Zwraca                         |
| ------------------------- | ------------------------------ |
| `fares(DAY, PRICES, 8)`   | `tensor([15., 23., 29., 33.])` |
| `fares(DAY, PRICES, 0)`   | `tensor([ 7., 15., 21., 25.])` |
| `takings(DAY, PRICES, 8)` | `100.0`                        |

Testy używają też tabel z inną liczbą kursów i kolumn, więc nie wpisuj na sztywno ani 2, ani 4. Jeśli `fares` zgłasza `RuntimeError` z komunikatem „size mismatch”, kształty tabeli i cen do siebie nie pasują, tak jak w lekcji. Jeśli według testów `takings` dało `tensor(100.)`, a powinno `100.0`, potrzebujesz liczby z wnętrza tensora: przyda się `.item()`.
