---
description: Zmierz dokładność sieci na obrazach, z których każdy został zaatakowany przez FGSM, dla kilku wartości ε.
---

# Dokładność pod atakiem

Część [Dokładność pod atakiem](../../../../notes/07-adversarial-examples/01-fooling-a-network.pl.md#dokładność-pod-atakiem) pokazała, jak spada dokładność sieci, która czyta cyfry, gdy rośnie ε. Dokończ dwie funkcje, które mierzą ją dla dowolnej sieci:

- `accuracy(model, X, y)` zwraca ułamek obrazów z `X`, które model czyta dobrze, jako liczbę od 0 do 1 typu `float`. Klasa, którą czyta model, to ta z największym logitem, a `.item()` zamienia tensor z jedną liczbą w liczbę Pythona.
- `accuracy_under_attack(model, X, y, epsilons)` zwraca słownik z dokładnością dla każdego ε z `epsilons`: dokładnością na obrazach, które `fgsm` robi z `X` przy tym ε.

`fgsm` jest już napisane. Tak samo `darkest_pixel()`, sieć z ćwiczenia [Jeden krok FGSM](../01-one-step-with-fgsm/task.pl.md), która mówi, który z czterech pikseli obrazu 2×2 jest najciemniejszy, i osiem obrazów dla niej, `X`, z ich etykietami, `y`:

| Wywołanie, z `model = darkest_pixel()`                           | Zwraca                                                         |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `accuracy(model, X, y)`                                          | `0.875`                                                        |
| `accuracy_under_attack(model, X, y, [0.0, 0.05, 0.1, 0.2, 0.3])` | `{0.0: 0.875, 0.05: 0.75, 0.1: 0.625, 0.2: 0.375, 0.3: 0.125}` |
| `accuracy_under_attack(model, X, y, [0.4])`                      | `{0.4: 0.0}`                                                   |

Sieć czyta dobrze 7 z 8 obrazów: w ostatnim najciemniejszy piksel nie jest tym, który wskazuje etykieta. Dla tej sieci FGSM odejmuje ε od piksela z etykiety i dodaje ε do pozostałych, więc obraz jest czytany źle, gdy 2ε przekroczy różnicę między jego najciemniejszym pikselem a następnym. Różnice siedmiu obrazów wynoszą od 0,05 do 0,7, dlatego dokładność spada skokami.

Kod, od którego zaczynasz, mierzy obrazy takie, jakie są, dla każdego ε: nigdy ich nie atakuje. Gdy już będzie je atakował, uważaj na dwie rzeczy:

- Każde ε atakuje obrazy, które funkcja dostała, `X`, a nie obrazy, które wyszły z poprzedniego ε.
- Atak potrzebuje nachyleń, więc nie może działać wewnątrz `torch.no_grad()`: tam `fgsm` zatrzymuje się z komunikatem „element 0 of tensors does not require grad and does not have a grad_fn”. Pomiar dokładności nie potrzebuje nachyleń i to on powinien trafić do środka.
