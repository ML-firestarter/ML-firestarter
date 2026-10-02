---
description: Policz predykcje regresji liniowej dla tabeli kursów i jej błąd średniokwadratowy, niezależnie od kształtu etykiet.
---

# Policz predykcje i błąd

W części [Model i jego strata](../../../../notes/05-pytorch/04-linear-regression-by-hand.pl.md#model-i-jego-strata) predykcje to $Xw + b$, a strata to ich błąd średniokwadratowy. Dokończ dwie funkcje:

- `predict(X, w, b)` zwraca predykcje dla wierszy `X`, tensor o kształcie `[rides, 1]`. `w` to tensor o kształcie `[features, 1]`, a `b` to liczba.
- `mse(y_pred, y)` zwraca błąd średniokwadratowy predykcji `y_pred`, o kształcie `[rides, 1]`, względem etykiet `y`, jako zwykłą liczbę Pythona. Etykiety mogą przyjść jako `[rides, 1]` albo `[rides]`, a tak czy inaczej każda predykcja musi być porównana z własną etykietą.

`X` zawiera cztery kursy dzienne z lekcji, `y` ich opłaty, a `w` ceny kilometra i minuty z naklejki.

| Wywołanie                              | Zwraca                                 |
| -------------------------------------- | -------------------------------------- |
| `predict(X, w, 8.0)`                   | `tensor([[15.], [23.], [29.], [33.]])` |
| `mse(predict(X, w, 8.0), y)`           | `0.0`                                  |
| `mse(predict(X, w, 0.0), y)`           | `64.0`                                 |
| `mse(predict(X, w, 8.0), y.flatten())` | `0.0`                                  |

Bez wyrazu wolnego każda opłata jest o 8 za niska, a 8 razy 8 to 64. Jeśli `mse` daje dużą liczbę dla etykiet o kształcie `[rides]`, dwa tensory zostały rozgłoszone w tabelę: spójrz na [kształty](../../../../notes/05-pytorch/04-linear-regression-by-hand.pl.md#model-i-jego-strata) i nadaj etykietom kształt predykcji.
