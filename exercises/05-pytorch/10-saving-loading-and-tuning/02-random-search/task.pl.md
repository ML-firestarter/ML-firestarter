---
description: Losuj hiperparametry, współczynnik uczenia w skali logarytmicznej i rozmiar warstwy, i wybierz najlepszą z prób.
---

# Przeszukiwanie losowe

W części [Strojenie hiperparametrów](../../../../notes/05-pytorch/10-saving-loading-and-tuning.pl.md#strojenie-hiperparametrów) program losował współczynnik uczenia i rozmiar warstwy i zachowywał próbę, która wypadła najlepiej. Dokończ dwie funkcje:

- `draw_settings(generator)` zwraca parę `(learning_rate, n_hidden)`. Współczynnik uczenia to `10 ** (u * 1.5 - 2)`, gdzie `u` to kolejna liczba z `torch.rand(1, generator=generator)`, czyli liczba między 0 a 1, więc współczynnik uczenia wypada między 0,01 a 0,316. `n_hidden` to liczba całkowita od 20 do 100 z `torch.randint(20, 101, (1,), generator=generator)`, losowana po `u`. Obie wartości pochodzą z przekazanego generatora.
- `best_trial(trials)` zwraca najlepszą próbę z listy. Próba to krotka `(score, learning_rate, n_hidden)`, a najlepsza jest ta z najwyższym wynikiem. Gdy dwie mają ten sam wynik, wygrywa wcześniejsza.

| Wywołanie                                                             | Zwraca               |
| --------------------------------------------------------------------- | -------------------- |
| `draw_settings(torch.Generator().manual_seed(7))`, pierwsze losowanie | około `(0.0634, 60)` |
| drugie losowanie z tego samego generatora                             | około `(0.0975, 31)` |
| `best_trial([(0.8, 0.1, 30), (0.9, 0.05, 60), (0.9, 0.2, 40)])`       | `(0.9, 0.05, 60)`    |

Każde losowanie zużywa liczby z generatora, więc kolejność ma znaczenie: najpierw współczynnik uczenia, potem rozmiar. Generator z ziarnem daje te same liczby, które PyTorch wylosuje na twoim komputerze, więc powyższe wyniki to te same, które dostaniesz także tam. `[0]` krotki to jej wynik.
