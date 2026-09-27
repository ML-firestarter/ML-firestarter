---
description: Oceń dowolną regułę na dowolnych zamówieniach, dokładnością i stratą logarytmiczną, i policz stratę logarytmiczną punktu odniesienia.
---

# Oceń klasyfikator

Napisz trzy funkcje. W każdej z nich `waits` zawiera czas oczekiwania każdego zamówienia, a `cancelled` jego etykietę, 1, jeśli je anulowano, i 0, jeśli nie, w tej samej kolejności.

- `accuracy(waits, cancelled, w, b)` zwraca odsetek zamówień, przy których reguła z wagą `w` i wyrazem wolnym `b` podejmuje trafną decyzję, przy progu 0,5.
- `loss(waits, cancelled, w, b)` zwraca stratę logarytmiczną reguły na tych zamówieniach.
- `baseline(cancelled)` zwraca stratę logarytmiczną punktu odniesienia, który daje każdemu zamówieniu to samo prawdopodobieństwo anulowania: odsetek zamówień, które anulowano.

| Wywołanie                                                      | Zwraca        |
| -------------------------------------------------------------- | ------------- |
| `accuracy([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.5, -4)` | około `0.667` |
| `loss([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 0.5, -4)`     | około `0.496` |
| `loss([2, 4, 6, 10, 12, 14], [0, 0, 1, 0, 1, 1], 1, -8)`       | około `0.716` |
| `baseline([0, 0, 1, 0, 1, 1])`                                 | około `0.693` |
| `baseline([0, 1, 1, 1])`                                       | około `0.562` |

Tabela zaokrągla liczby do 3 miejsc po przecinku, ale sprawdzenia tego nie robią. W każdym sprawdzeniu część zamówień anulowano, a części nie, więc prawdopodobieństwo punktu odniesienia nigdy nie wynosi 0 ani 1.

Jeśli `accuracy` daje `4` tam, gdzie powinna dać około `0.667`, liczy trafne decyzje, ale nie dzieli ich przez liczbę zamówień.
