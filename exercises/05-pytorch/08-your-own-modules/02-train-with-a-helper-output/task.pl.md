---
description: Wytrenuj przez jedną epokę model, który przyjmuje dwa wejścia i zwraca dwa wyjścia, ze stratą pomocniczą dodaną do głównej.
---

# Trening z wyjściem pomocniczym

W [ostatniej części lekcji o własnych modułach](../../../../notes/05-pytorch/08-your-own-modules.pl.md#dwa-wyjścia) model był trenowany z wyjściem pomocniczym. Dokończ funkcję `train_one_epoch(model, loader, optimizer, criterion, aux_weight)`, która wykonuje jedną epokę takiego treningu i zwraca średnią stratę porcji jako zwykłą liczbę:

- `loader` podaje trzy tensory dla każdej porcji: wejścia szerokie, wejścia głębokie i etykiety.
- `model(X_wide_batch, X_deep_batch)` zwraca dwa wyjścia, główne i pomocnicze. Model `WithHelper` jest już gotowy, podobnie jak tensory `X_wide`, `X_deep` i `y`, czyli kilka kursów ze standaryzowanymi cechami.
- Strata porcji to `criterion(main_output, y_batch)` plus `aux_weight` razy `criterion(aux_output, y_batch)`. To od tej całej straty liczy się nachylenia i to ją wlicza się do średniej.
- Dla każdej porcji wykonywany jest krok, a nachylenia są zerowane, zanim zostaną policzone nachylenia następnej porcji.

Kod przechodzi po porcjach i sumuje ich straty, ale tylko dla wyjścia głównego, i nie wykonuje kroków. Brakuje w nim części straty pochodzącej z wyjścia pomocniczego i kroków.

| Wywołanie dla `WithHelper(1, 2)` utworzonego po `torch.manual_seed(0)`, `SGD` z `lr=0.1` i porcji po 2 | Zwraca         |
| ------------------------------------------------------------------------------------------------------ | -------------- |
| `train_one_epoch(model, loader, optimizer, nn.MSELoss(), 0.5)`                                         | około `1.0495` |
| to samo z `aux_weight=0`                                                                               | około `0.7691` |

Przy wadze 0 wyjście pomocnicze nie wpływa na stratę, a średnia to główna strata z dwóch porcji. Jeśli strata w drugiej epoce nie wynosi około 0,692, nachylenia nie zostały wyzerowane między porcjami.
