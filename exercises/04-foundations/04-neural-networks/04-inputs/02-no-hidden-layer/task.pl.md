---
description: Wystandaryzuj długość każdego kursu i jej kwadrat i wytrenuj na nich regresję logistyczną, tak żeby narysowała U bez warstwy ukrytej.
---

# U bez warstwy ukrytej

Dokończ dwie funkcje, żeby wytrenować regresję logistyczną na km i km², tak jak w lekcji [Przygotowanie wejść](../../../../../notes/04-foundations/04-neural-networks/04-inputs.pl.md):

- `inputs(km)` zwraca dwa wejścia dla kursu na `km` km, wystandaryzowane tak jak w części [Standaryzacja wejść](../../../../../notes/04-foundations/04-neural-networks/04-inputs.pl.md#standaryzacja-wejść): km pomniejszone o `KM_AVERAGE` i podzielone przez `KM_SPREAD` oraz km² pomniejszone o `SQUARE_AVERAGE` i podzielone przez `SQUARE_SPREAD`. Zwraca je jako krotkę, na przykład `return x1, x2`. Na razie zwraca km i km² bez zmian.
- `train(learning_rate, steps)` zaczyna z obiema wagami i wyrazem wolnym równymi 0, robi `steps` kroków spadku gradientu ze współczynnikiem uczenia `learning_rate` i zwraca wagi i wyraz wolny, na których skończyła, jako krotkę, na przykład `return w1, w2, b`. `slopes(weights)` daje nachylenia względem `w1`, `w2` i `b`, w tej kolejności.

Funkcje `predict`, `loss` i `slopes` są gotowe i też przyjmują wagi i wyraz wolny jako krotkę. `TURNED_DOWN` mówi, ile ze 100 zamówień każdej długości odrzucono, a średnie i rozrzuty to te z lekcji. `SQUARE_SPREAD` to 65,48 z lekcji przed zaokrągleniem, czyli pierwiastek kwadratowy z 4288.

| Wywołanie                               | Zwraca                         |
| --------------------------------------- | ------------------------------ |
| `inputs(8)`                             | około `(0.0, -0.244)`          |
| `inputs(14)`                            | około `(1.5, 1.771)`           |
| `train(1, 0)`                           | `(0, 0, 0)`                    |
| `train(1, 1)`                           | około `(0.103, 0.155, -0.181)` |
| `round(loss(train(1, 1000)), 3)`        | `0.439`                        |
| `round(predict(5, train(1, 10000)), 3)` | `0.103`                        |

Tabela zaokrągla wyniki do 3 miejsc po przecinku, ale sprawdzenia tego nie robią. Dwa ostatnie wywołania same zaokrąglają stratę i prawdopodobieństwo, żeby nie liczyły się maleńkie różnice w obliczeniach z tysięcy kroków. Po 10 000 kroków wagi i wyraz wolny wynoszą około −6,04; 6,75 i −1,03, tak jak w części [Nowe zamówienia](../../../../../notes/04-foundations/04-neural-networks/04-inputs.pl.md#nowe-zamówienia).

Jeśli `train(1, 0)` nie daje `(0, 0, 0)`, pętla wykonuje się o jeden raz za dużo: przy 0 krokach wagi i wyraz wolny zostają równe 0.

Jeśli `train` zgłasza `OverflowError`, sprawdź najpierw `inputs`. Na km i km² bez zmian współczynnik uczenia 1 jest o wiele za duży: już po jednym kroku wagi są tak daleko od właściwych, że wynik `math.exp` w funkcji `sigmoid` staje się za duży, żeby Python mógł go zapisać.

Jeśli sprawdzenie pokazuje poprawne liczby, ale w nawiasach kwadratowych, funkcja zwraca listę: zwróć zamiast niej krotkę, na przykład `return x1, x2`.
