---
description: Policz na podstawie logitów dokładność klasyfikatora, jego dokładność top-2 i średnią pewność.
---

# Raport klasyfikacji

*Korzysta z lekcji [Klasyfikacja obrazów](../../../../notes/05-pytorch/09-classifying-images.pl.md), z której przydadzą się `argmax`, `softmax` i `topk`, oraz z lekcji [Tensory](../../../../notes/05-pytorch/01-tensors.pl.md), z której przyda się porównywanie i uśrednianie tensorów.*

Klasyfikator daje dla każdego przykładu wiersz logitów, po jednym na klasę. Dokończ funkcję `report(logits, labels)`, gdzie `logits` ma kształt `[n, classes]`, a `labels` to tensor z `n` właściwymi klasami. Funkcja zwraca słownik z trzema liczbami, każdą zaokrągloną do 4 miejsc po przecinku:

- `"accuracy"`: udział przykładów, dla których klasa z najwyższym logitem zgadza się z etykietą.
- `"top2"`: udział przykładów, dla których etykieta jest jedną z dwóch klas o najwyższych logitach.
- `"confidence"`: średnia z najwyższych prawdopodobieństw, które `softmax` daje dla poszczególnych przykładów.

| Wywołanie dla 4 przykładów i 3 klas          | Zwraca                                                  |
| -------------------------------------------- | ------------------------------------------------------- |
| `report(logits, torch.tensor([0, 1, 0, 2]))` | `{"accuracy": 0.75, "top2": 1.0, "confidence": 0.7007}` |
| `report(logits, torch.tensor([2, 2, 2, 2]))` | `{"accuracy": 0.25, "top2": 0.5, "confidence": 0.7007}` |

Pewność nie zależy od etykiet, tylko od tego, jak bardzo sieć jest pewna swoich odpowiedzi. Sieć bardzo pewna siebie, która często się myli, ma pewność dużo wyższą niż dokładność.
