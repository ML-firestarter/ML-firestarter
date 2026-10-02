---
description: Wytrenuj przez jedną epokę model, który bierze dwa wejścia i zwraca dwa wyjścia, ze stratą pomocniczą dodaną do głównej.
---

# Trening z wyjściem pomocniczym

[Ostatnia część lekcji Własne moduły](../../../../notes/05-pytorch/08-your-own-modules.pl.md#dwa-wyjścia) trenowała model z wyjściem pomocniczym. Dokończ `train_one_epoch(model, loader, optimizer, criterion, aux_weight)`, które robi jedną jego epokę i zwraca średnią stratę paczek jako zwykłą liczbę:

- `loader` daje trzy tensory dla każdej paczki: wejścia szerokie, wejścia głębokie i etykiety.
- `model(X_wide_batch, X_deep_batch)` zwraca dwa wyjścia, główne i pomocnicze. Model `WithHelper` jest już napisany, tak samo jak tensory `X_wide`, `X_deep` i `y`, kilka kursów ze standaryzowanymi cechami.
- Strata paczki to `criterion(main_output, y_batch)` plus `aux_weight` razy `criterion(aux_output, y_batch)`. Ta cała strata dostaje nachylenia i jest dodawana do średniej.
- Każda paczka robi krok, a nachylenia są zerowane, zanim policzy się nachylenia następnej.

Kod przechodzi po paczkach i dodaje ich straty, ale tylko wyjścia głównego, i nie robi kroków. Brakuje mu części straty z wyjścia pomocniczego i kroków.

| Wywołanie, z `WithHelper(1, 2)` zrobionym po `torch.manual_seed(0)`, `SGD` z `lr=0.1` i paczkami po 2 | Zwraca          |
| ---------------------------------------------------------------------------------------------------- | --------------- |
| `train_one_epoch(model, loader, optimizer, nn.MSELoss(), 0.5)`                                       | około `1.0495`  |
| to samo z `aux_weight=0`                                                                             | około `0.7691`  |

Przy wadze 0 wyjście pomocnicze nie bierze udziału w stracie, a średnia to główna strata dwóch paczek. Jeśli strata drugiej epoki nie wynosi około 0,692, nachylenia nie zostały wyzerowane między paczkami.
