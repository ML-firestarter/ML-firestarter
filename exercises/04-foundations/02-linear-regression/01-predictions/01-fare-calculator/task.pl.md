---
description: Policz opłaty za taksówkę przy dowolnym cenniku, dla jednego kursu albo całej listy kursów.
---

# Kalkulator opłat

W lekcji [Przewidywanie](../../../../../notes/04-foundations/02-linear-regression/01-predictions.pl.md) funkcja `predict(km)` miała ceny z naklejki, 3 za km i 8 na start, wpisane na stałe. Model, który się uczy, potrzebuje ich jako argumentów, żeby móc sprawdzać inne. Dokończ dwie funkcje:

- `predict(km, w, b)` zwraca opłatę za kurs na `km` kilometrów przy cenie za km `w` i opłacie początkowej `b`.
- `predict_all(kms, w, b)` dostaje listę odległości i zwraca listę opłat za te kursy, w tej samej kolejności. Pętla już jest, ale dla każdego kursu wstawia do listy 0.

| Wywołanie                         | Zwraca             |
| --------------------------------- | ------------------ |
| `predict(5, 3, 8)`                | `23`               |
| `predict(10, 2.5, 4)`             | `29.0`             |
| `predict_all([2, 4, 6, 8], 3, 8)` | `[14, 20, 26, 32]` |
| `predict_all([], 3, 8)`           | `[]`               |

Jeśli `predict` przechodzi swoje sprawdzenia, a `predict_all` nie, zobacz, co pętla dodaje do listy: `predict_all` może wywołać `predict` dla każdego kursu.
