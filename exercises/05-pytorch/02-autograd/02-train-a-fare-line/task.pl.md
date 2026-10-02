---
description: Umieść cztery kroki treningu w pętli i pozwól autogradowi znaleźć nachylenia, żeby wytrenować prostą opłat na dowolnych paragonach.
---

# Wytrenuj prostą opłat

[Trening prostej opłat](../../../../notes/05-pytorch/02-autograd.pl.md#trening-prostej-opłat) wytrenował prostą na paragonach dziennych, pętlą z czterech kroków. Dokończ `train(kms, fares, steps, learning_rate)`, które robi to dla dowolnych paragonów i zwraca wagę i wyraz wolny, z którymi kończy, jako parę `(w, b)` zwykłych liczb Pythona. `kms` i `fares` to tensory z jedną liczbą dla każdego kursu.

`train` zaczyna od $w = 0$ i $b = 0$ i wykonuje `steps` kroków spadku gradientu na błędzie średniokwadratowym. Kod ma już parametry i krok w przód, czyli wiersz `loss = ...`. Brakuje pozostałych trzech kroków: `backward()`, kroku przeciwnie do nachyleń wewnątrz `torch.no_grad()` i wyzerowania obu `.grad`.

`KMS` i `FARES` zawierają paragony dzienne.

| Wywołanie                       | Zwraca               |
| ------------------------------- | -------------------- |
| `train(KMS, FARES, 0, 0.02)`    | `(0.0, 0.0)`         |
| `train(KMS, FARES, 1, 0.02)`    | około `(5.6, 1.0)`   |
| `train(KMS, FARES, 2, 0.02)`    | około `(4.28, 0.84)` |
| `train(KMS, FARES, 1500, 0.02)` | około `(3.0, 10.0)`  |

Jeden krok od $w = 0$ i $b = 0$ przesuwa je do 5,6 i 1, bo nachylenia są tam równe −280 i −50, jak w części [Nachylenia straty](../../../../notes/05-pytorch/02-autograd.pl.md#nachylenia-straty), a 0,02 × 280 to 5,6. Jeśli drugi krok nie dochodzi do `(4.28, 0.84)`, tylko do czegoś większego, nachylenia dodały się do nachyleń z pierwszego kroku: po każdym kroku trzeba je z powrotem ustawić na 0, dla obu parametrów. Jeśli `train` zgłasza `RuntimeError` o „a leaf Variable that requires grad”, krok jest poza `torch.no_grad()`.
