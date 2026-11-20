---
description: Zmierz dokładność sieci na obrazach zaatakowanych przez FGSM, dla kilku wartości ε.
---

# Dokładność pod atakiem

W części [Dokładność pod atakiem](../../../../notes/07-adversarial-examples/01-fooling-a-network.pl.md#dokładność-pod-atakiem) dokładność sieci rozpoznającej cyfry spadała wraz ze wzrostem ε. Dokończ dwie funkcje, które mierzą ją dla dowolnej sieci:

- `accuracy(model, X, y)` zwraca odsetek obrazów z `X`, które model rozpoznaje poprawnie, jako liczbę typu `float` od 0 do 1. Model wybiera klasę o największym logicie, a `.item()` zamienia jednoelementowy tensor na liczbę Pythona.
- `accuracy_under_attack(model, X, y, epsilons)` zwraca słownik z dokładnością dla każdego ε z listy `epsilons`, czyli z dokładnością na obrazach, które `fgsm` tworzy z `X` przy tym ε.

Gotowe są `fgsm`, `darkest_pixel()`, czyli sieć z ćwiczenia [Jeden krok FGSM](../01-one-step-with-fgsm/task.pl.md), która wskazuje najciemniejszy z czterech pikseli obrazu 2×2, oraz osiem obrazów dla tej sieci, `X`, z etykietami `y`:

| Wywołanie, z `model = darkest_pixel()`                           | Zwraca                                                         |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `accuracy(model, X, y)`                                          | `0.875`                                                        |
| `accuracy_under_attack(model, X, y, [0.0, 0.05, 0.1, 0.2, 0.3])` | `{0.0: 0.875, 0.05: 0.75, 0.1: 0.625, 0.2: 0.375, 0.3: 0.125}` |
| `accuracy_under_attack(model, X, y, [0.4])`                      | `{0.4: 0.0}`                                                   |

Sieć rozpoznaje poprawnie 7 z 8 obrazów: w ostatnim najciemniejszy piksel nie jest tym, który wskazuje etykieta. W tej sieci FGSM odejmuje ε od piksela wskazanego przez etykietę i dodaje ε do pozostałych, więc obraz zostaje rozpoznany błędnie, gdy 2ε przekroczy różnicę między jego najciemniejszym pikselem a drugim najciemniejszym. Te różnice wynoszą od 0,05 do 0,7, dlatego dokładność spada skokowo.

Kod startowy dla każdego ε mierzy dokładność na niezmienionych obrazach, bez żadnego ataku. Gdy dodasz atak, pamiętaj o dwóch rzeczach:

- Dla każdego ε atakuj obrazy przekazane do funkcji, `X`, a nie wynik ataku z poprzednim ε.
- Atak potrzebuje nachyleń, więc nie może działać wewnątrz `torch.no_grad()`: tam `fgsm` zatrzymuje się z komunikatem „element 0 of tensors does not require grad and does not have a grad_fn”. Pomiar dokładności nachyleń nie potrzebuje i to on powinien trafić do środka.
