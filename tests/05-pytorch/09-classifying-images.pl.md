# Klasyfikacja obrazów

## Sieć dla 5 klas dostaje porcję 32 obrazów. Jaki kształt mają jej logity?

- [x] `[32, 5]`
- [ ] `[5, 32]`
- [ ] `[32]`
- [ ] `[32, 1]`

Ostatnia warstwa ma po jednym wyjściu na klasę, więc każdy obraz dostaje 5 wyników, a porcja 32 obrazów daje 32 wiersze z nimi. `argmax(dim=1)` wybiera potem najlepszy z 5 w każdym wierszu.

## Jaka strata pasuje do klasyfikatora, którego ostatnia warstwa daje jeden logit na klasę?

- [x] `nn.CrossEntropyLoss()`, która bierze logity i numery klas
- [ ] `nn.MSELoss()`, która bierze prawdopodobieństwa
- [ ] `nn.CrossEntropyLoss()`, po softmaxie na logitach
- [ ] `nn.MSELoss()`, która bierze numery klas

`CrossEntropyLoss` stosuje softmax sama, więc bierze logity takie, jakie są, a etykiety jako numery klas. Softmax przed nią byłby zastosowany dwa razy, a błąd średniokwadratowy nie jest zrobiony do wybierania spośród klas.

## Co się dzieje z `nn.CrossEntropyLoss()(logits, torch.tensor([1.0, 0.0]))`?

- [x] Błąd: numery klas muszą być typu `long`, a nie liczbami zmiennoprzecinkowymi
- [ ] Działa, a etykiety są traktowane jak prawdopodobieństwa
- [ ] Działa i daje dokładność
- [ ] Błąd: bierze tylko jeden obraz naraz

Numery klas to liczby całkowite, `torch.tensor([1, 0])`, a strata mówi, że oczekiwała celu typu Long albo Byte. `1.0` i `0.0` to liczby zmiennoprzecinkowe.

## Strata pierwszej epoki 10-klasowej sieci wynosi 2,27. Co to mówi?

- [x] Sieć prawie nic jeszcze nie wie: 10 równych zgadnięć kosztuje około 2,30
- [ ] Sieć już trafia w 2 obrazy z 10
- [ ] Trening się rozbiegł
- [ ] Strata jest w złych jednostkach

Sieć, która daje wszystkim 10 cyfrom to samo prawdopodobieństwo, 0,1, ma stratę $-\ln 0{,}1 = 2{,}30$ za każdy obraz, a sieć, która dopiero zaczyna, jest blisko tego. Strata maleje, gdy sieć się uczy.

## Co daje `logits.argmax(dim=1)` dla porcji logitów `[32, 10]`?

- [x] Klasę z największym logitem dla każdego z 32 obrazów
- [ ] Największy logit całej porcji
- [ ] Prawdopodobieństwo każdej klasy
- [ ] 10 klas w kolejności wielkości

`dim=1` to wymiar klas, więc dla każdego wiersza z 10 logitami `argmax` daje numer, od 0 do 9, największego z nich: tensor 32 numerów klas, odpowiedzi sieci.
