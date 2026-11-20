---
description: Zamknij cztery kroki treningu w pętli i pozwól autogradowi znaleźć nachylenia, żeby wytrenować prostą opłat na dowolnych paragonach.
---

# Wytrenuj prostą opłat

W części [Trening prostej opłat](../../../../notes/05-pytorch/02-autograd.pl.md#trening-prostej-opłat) prosta została wytrenowana na dziennych paragonach pętlą z czterech kroków. Dokończ funkcję `train(kms, fares, steps, learning_rate)`, która robi to samo dla dowolnych paragonów i zwraca końcową wagę i wyraz wolny jako parę `(w, b)` zwykłych liczb Pythona. `kms` i `fares` to tensory z jedną liczbą dla każdego kursu.

`train` zaczyna od $w = 0$ i $b = 0$ i wykonuje `steps` kroków spadku gradientu dla błędu średniokwadratowego. W kodzie są już parametry i krok w przód, czyli wiersz `loss = ...`. Brakuje pozostałych trzech kroków: `backward()`, kroku w stronę przeciwną do nachyleń wewnątrz `torch.no_grad()` i wyzerowania obu `.grad`.

`KMS` i `FARES` zawierają dzienne paragony.

| Wywołanie                       | Zwraca               |
| ------------------------------- | -------------------- |
| `train(KMS, FARES, 0, 0.02)`    | `(0.0, 0.0)`         |
| `train(KMS, FARES, 1, 0.02)`    | około `(5.6, 1.0)`   |
| `train(KMS, FARES, 2, 0.02)`    | około `(4.28, 0.84)` |
| `train(KMS, FARES, 1500, 0.02)` | około `(3.0, 10.0)`  |

Jeden krok od $w = 0$ i $b = 0$ przesuwa je do 5,6 i 1, bo nachylenia wynoszą tam −280 i −50, jak w części [Nachylenia straty](../../../../notes/05-pytorch/02-autograd.pl.md#nachylenia-straty), a 0,02 × 280 to 5,6. Jeśli drugi krok nie kończy się na `(4.28, 0.84)`, tylko na czymś większym, nachylenia dodały się do tych z pierwszego kroku: po każdym kroku trzeba je wyzerować, dla obu parametrów. Jeśli `train` zgłasza `RuntimeError` o „a leaf Variable that requires grad”, krok wykonuje się poza `torch.no_grad()`.
