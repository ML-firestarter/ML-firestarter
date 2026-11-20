# Klasyfikacja obrazów

## Sieć dla 5 klas dostaje porcję 32 obrazów. Jaki kształt mają jej logity?

- [x] `[32, 5]`
- [ ] `[5, 32]`
- [ ] `[32]`
- [ ] `[32, 1]`

Ostatnia warstwa ma po jednym wyjściu na klasę, więc każdy obraz dostaje 5 wyników, a porcja 32 obrazów daje 32 wiersze takich wyników. `argmax(dim=1)` wybiera potem w każdym wierszu najlepszy z pięciu.

## Jaka funkcja straty pasuje do klasyfikatora, którego ostatnia warstwa daje jeden logit na klasę?

- [x] `nn.CrossEntropyLoss()`, która przyjmuje logity i numery klas
- [ ] `nn.MSELoss()`, która przyjmuje prawdopodobieństwa
- [ ] `nn.CrossEntropyLoss()`, ale po softmaxie na logitach
- [ ] `nn.MSELoss()`, która przyjmuje numery klas

`CrossEntropyLoss` sama stosuje softmax, więc przyjmuje logity w takiej postaci, w jakiej są, a etykiety jako numery klas. Softmax przed nią zostałby zastosowany dwa razy, a błąd średniokwadratowy nie służy do wybierania spośród klas.

## Co się stanie przy `nn.CrossEntropyLoss()(logits, torch.tensor([1.0, 0.0]))`?

- [x] Błąd: numery klas muszą być typu `long`, a nie zmiennoprzecinkowe
- [ ] Zadziała, a etykiety zostaną potraktowane jak prawdopodobieństwa
- [ ] Zadziała i da dokładność
- [ ] Błąd: strata przyjmuje tylko jeden obraz naraz

Numery klas to liczby całkowite, `torch.tensor([1, 0])`, a strata zgłasza, że oczekiwała celu typu Long albo Byte. `1.0` i `0.0` to liczby zmiennoprzecinkowe.

## Strata w pierwszej epoce sieci dla 10 klas wynosi 2,27. O czym to świadczy?

- [x] Sieć jeszcze prawie nic nie wie: równe szanse dla 10 klas kosztują około 2,30
- [ ] Sieć już trafia w 2 obrazy na 10
- [ ] Trening się rozbiegł
- [ ] Strata jest w złych jednostkach

Sieć, która daje wszystkim 10 cyfrom to samo prawdopodobieństwo, 0,1, ma na każdym obrazie stratę $-\ln 0{,}1 = 2{,}30$, a sieć, która dopiero zaczyna się uczyć, jest blisko tej wartości. W miarę nauki strata maleje.

## Co daje `logits.argmax(dim=1)` dla porcji logitów o kształcie `[32, 10]`?

- [x] Klasę z największym logitem dla każdego z 32 obrazów
- [ ] Największy logit w całej porcji
- [ ] Prawdopodobieństwo każdej klasy
- [ ] 10 klas uporządkowanych według wielkości

`dim=1` to wymiar klas, więc dla każdego wiersza z 10 logitami `argmax` daje numer największego z nich, od 0 do 9. Wynik to tensor 32 numerów klas, czyli odpowiedzi sieci.
