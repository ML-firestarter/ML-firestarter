---
description: Zapisz sigmoidę i regułę, która zamienia czas oczekiwania w prawdopodobieństwo anulowania, przy dowolnej wadze i dowolnym wyrazie wolnym.
---

# Kalkulator prawdopodobieństwa

W lekcji [Przewidywanie prawdopodobieństwa](../../../../../notes/04-foundations/03-logistic-regression/01-probabilities.pl.md) funkcja `probability(wait)` korzystała z wagi i wyrazu wolnego ustawionych poza nią, 0,5 i −4. Model, który się uczy, potrzebuje ich jako argumentów, żeby móc sprawdzać inne. Dokończ dwie funkcje:

- `sigmoid(z)` zwraca wartość sigmoidy w punkcie `z`, jak w części [Ściskanie prostej](../../../../../notes/04-foundations/03-logistic-regression/01-probabilities.pl.md#ściskanie-prostej). `math.exp(x)` liczy e do potęgi `x`.
- `probability(wait, w, b)` zwraca prawdopodobieństwo, że zamówienie z czasem oczekiwania `wait` minut zostanie anulowane, według reguły z wagą `w` i wyrazem wolnym `b`. Już liczy wynik prostej, `z`, ale zwraca go bez zmian.

| Wywołanie                 | Zwraca        |
| ------------------------- | ------------- |
| `sigmoid(0)`              | `0.5`         |
| `sigmoid(2)`              | około `0.881` |
| `probability(8, 0.5, -4)` | `0.5`         |
| `probability(6, 0.5, -4)` | około `0.269` |
| `probability(6, 1, -8)`   | około `0.119` |

Tabela zaokrągla prawdopodobieństwa do 3 miejsc po przecinku, ale sprawdzenia tego nie robią, więc nie zaokrąglaj ich w funkcjach.

Jeśli `probability(6, 0.5, -4)` daje `-1.0`, funkcja zwraca wynik prostej bez zmian: najpierw ściśnij go funkcją `sigmoid`.
