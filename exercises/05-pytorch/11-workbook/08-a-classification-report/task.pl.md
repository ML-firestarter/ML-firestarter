---
description: Policz dokładność, dokładność top-2 i średnią pewność klasyfikatora z jego logitów.
---

# Raport klasyfikacji

*Korzysta z [Klasyfikacja obrazów](../../../../notes/05-pytorch/09-classifying-images.pl.md) dla `argmax`, `softmax` i `topk` oraz [Tensory](../../../../notes/05-pytorch/01-tensors.pl.md) dla porównywania i uśredniania tensorów.*

Klasyfikator daje dla każdego przykładu wiersz logitów, po jednym dla każdej klasy. Dokończ `report(logits, labels)`, gdzie `logits` ma kształt `[n, classes]`, a `labels` to tensor `n` właściwych klas. Zwraca słownik z trzema liczbami, każda zaokrąglona do 4 miejsc po przecinku:

- `"accuracy"`: udział przykładów, w których klasa z najwyższym logitem jest etykietą.
- `"top2"`: udział przykładów, w których etykieta jest wśród dwóch klas o najwyższych logitach.
- `"confidence"`: średnia, po przykładach, z najwyższego prawdopodobieństwa, które daje `softmax`.

| Wywołanie, z 4 przykładami po 3 klasy                               | Zwraca                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------- |
| `report(logits, torch.tensor([0, 1, 0, 2]))`                        | `{"accuracy": 0.75, "top2": 1.0, "confidence": 0.7007}`       |
| `report(logits, torch.tensor([2, 2, 2, 2]))`                        | `{"accuracy": 0.25, "top2": 0.5, "confidence": 0.7007}`       |

Pewność nie zależy od etykiet, tylko od tego, jak bardzo sieć jest pewna. Sieć bardzo pewna i często się myląca ma pewność dużo wyższą niż dokładność.
