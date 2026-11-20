---
description: Policz predykcje regresji liniowej dla tabeli kursów i ich błąd średniokwadratowy, bez względu na kształt etykiet.
---

# Predykcje i strata

W części [Model i jego strata](../../../../notes/05-pytorch/04-linear-regression-by-hand.pl.md#model-i-jego-strata) predykcje to $Xw + b$, a strata to ich błąd średniokwadratowy. Dokończ dwie funkcje:

- `predict(X, w, b)` zwraca predykcje dla wierszy `X` jako tensor o kształcie `[rides, 1]`. `w` to tensor o kształcie `[features, 1]`, a `b` to liczba.
- `mse(y_pred, y)` zwraca błąd średniokwadratowy predykcji `y_pred` o kształcie `[rides, 1]` względem etykiet `y`, jako zwykłą liczbę Pythona. Etykiety mogą mieć kształt `[rides, 1]` albo `[rides]`, ale w obu przypadkach każdą predykcję trzeba porównać z jej własną etykietą.

`X` zawiera cztery kursy dzienne z lekcji, `y` ich opłaty, a `w` ceny kilometra i minuty postoju z naklejki.

| Wywołanie                              | Zwraca                                 |
| -------------------------------------- | -------------------------------------- |
| `predict(X, w, 8.0)`                   | `tensor([[15.], [23.], [29.], [33.]])` |
| `mse(predict(X, w, 8.0), y)`           | `0.0`                                  |
| `mse(predict(X, w, 0.0), y)`           | `64.0`                                 |
| `mse(predict(X, w, 8.0), y.flatten())` | `0.0`                                  |

Bez wyrazu wolnego każda opłata wychodzi o 8 zł za niska, a 8 razy 8 to 64. Jeśli `mse` daje dużą liczbę dla etykiet o kształcie `[rides]`, oba tensory rozgłosiły się do tabeli: zajrzyj do części o [kształtach](../../../../notes/05-pytorch/04-linear-regression-by-hand.pl.md#model-i-jego-strata) i nadaj etykietom kształt predykcji.
