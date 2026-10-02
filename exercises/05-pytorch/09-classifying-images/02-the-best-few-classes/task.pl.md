---
description: Znajdź kilka najlepszych klas każdego obrazu, z prawdopodobieństwami wśród nich.
---

# Kilka najlepszych klas

[Odczytywanie odpowiedzi](../../../../notes/05-pytorch/09-classifying-images.pl.md#odczytywanie-odpowiedzi) wzięło trzy najlepsze klasy obrazu przez `torch.topk` i zamieniło ich logity w prawdopodobieństwa przez softmax. Dokończ `best_classes(logits, k)`, które robi to dla całej porcji. `logits` ma kształt `[pictures, classes]`, a `k` to liczba klas do zachowania. Zwraca parę: numery `k` najlepszych klas każdego obrazu, od najlepszej, jako listę list, i prawdopodobieństwa wśród nich, tensor o kształcie `[pictures, k]`, z softmaxu tylko po `k` logitach, tak żeby każdy wiersz sumował się do 1.

| Wywołanie, z 2 obrazami i 4 klasami | Zwraca                                                               |
| ----------------------------------- | -------------------------------------------------------------------- |
| `best_classes(logits, 2)`           | klasy `[[0, 3], [3, 2]]`, z około `[[0.731, 0.269], [0.891, 0.109]]` |
| `best_classes(logits, 1)`           | klasy `[[0], [3]]`, z `[[1.0], [1.0]]`                               |

Logity to `[[2.0, 0.5, -1.0, 1.0], [0.1, 0.2, 0.9, 3.0]]`, więc najlepsza klasa pierwszego obrazu to 0, a druga najlepsza to 3. `torch.topk(logits, k=k, dim=1)` daje `k` największych logitów każdego wiersza i ich klasy, a `.tolist()` zamienia klasy w listy. Softmax tylko po najwyższych logitach to nie to samo co prawdopodobieństwo z softmaxu całej sieci: najlepsza klasa pierwszego obrazu ma 0,731 wśród 2 najlepszych, a mniej wśród wszystkich 4.
