---
description: Znajdź kilka najlepszych klas każdego obrazu i ich prawdopodobieństwa liczone tylko między nimi.
---

# Kilka najlepszych klas

W części [Odczytywanie odpowiedzi](../../../../notes/05-pytorch/09-classifying-images.pl.md#odczytywanie-odpowiedzi) program wybrał trzy najlepsze klasy obrazu przez `torch.topk` i zamienił ich logity na prawdopodobieństwa przez softmax. Dokończ funkcję `best_classes(logits, k)`, która robi to samo dla całej porcji. `logits` ma kształt `[pictures, classes]`, a `k` to liczba klas do zachowania. Funkcja zwraca parę: numery `k` najlepszych klas każdego obrazu, od najlepszej, jako listę list, oraz ich prawdopodobieństwa jako tensor o kształcie `[pictures, k]`, z softmaxu liczonego tylko po tych `k` logitach, tak żeby każdy wiersz sumował się do 1.

| Wywołanie dla 2 obrazów i 4 klas | Zwraca                                                              |
| -------------------------------- | ------------------------------------------------------------------- |
| `best_classes(logits, 2)`        | klasy `[[0, 3], [3, 2]]` i około `[[0.731, 0.269], [0.891, 0.109]]` |
| `best_classes(logits, 1)`        | klasy `[[0], [3]]` i `[[1.0], [1.0]]`                               |

Logity to `[[2.0, 0.5, -1.0, 1.0], [0.1, 0.2, 0.9, 3.0]]`, więc najlepsza klasa pierwszego obrazu to 0, a druga w kolejności to 3. `torch.topk(logits, k=k, dim=1)` daje `k` największych logitów z każdego wiersza i ich klasy, a `.tolist()` zamienia klasy na listy. Softmax liczony tylko po największych logitach to nie to samo co prawdopodobieństwo z softmaxu po wszystkich klasach: najlepsza klasa pierwszego obrazu ma 0,731 wśród 2 najlepszych, a mniej wśród wszystkich 4.
