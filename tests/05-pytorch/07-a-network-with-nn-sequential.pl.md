# Sieć z nn.Sequential

## Ile parametrów ma `nn.Sequential(nn.Linear(3, 4), nn.ReLU(), nn.Linear(4, 1))`?

- [x] 21
- [ ] 16
- [ ] 17
- [ ] 12

Pierwsza warstwa ma 3 × 4 = 12 wag i 4 wyrazy wolne, razem 16, a druga 4 × 1 = 4 wagi i 1 wyraz wolny, czyli jeszcze 5. `ReLU` nie ma parametrów. 12 to tylko wagi pierwszej warstwy.

## Co jest nie tak z `nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(40, 1))`?

- [x] Pierwsza warstwa daje 50 liczb, a druga przyjmuje 40, więc kształty do siebie nie pasują
- [ ] Nic: Sequential sam dopasowuje rozmiary
- [ ] ReLU nie może stać po pierwszej warstwie
- [ ] Ostatnia warstwa musi mieć 2 wyjścia

`out_features` jednej warstwy musi być równe `in_features` następnej. Tutaj 50 liczb trafia do warstwy, która oczekuje 40, i mnożenie kończy się błędem o kształtach.

## Czym są razem trzy warstwy `nn.Linear` bez ReLU między nimi?

- [x] Jedną warstwą liniową, czyli prostą, niezależnie od liczby warstw
- [ ] Siecią, która narysuje dowolny kształt
- [ ] Warstwą trzy razy dokładniejszą
- [ ] Błędem, bo warstwy potrzebują ReLU

Funkcja liniowa z funkcji liniowej jest liniowa, więc warstwy składają się w jedną, a model nie potrafi narysować załamania. Dwie warstwy z lekcji bez niczego pomiędzy nie wypadły lepiej niż jedna.

## Dlaczego przed treningiem sieci opłaty są standaryzowane?

- [x] Trafiają wtedy blisko 0, jak pierwsze predykcje sieci, więc pierwsze kroki są łagodne
- [ ] Sieć nie przyjmuje liczb większych od 1
- [ ] Dzięki temu sieć może pominąć standaryzację cech
- [ ] Dzięki temu opłaty są nieujemne

Sieć zaczyna od małych losowych wag, więc jej pierwsze predykcje są bliskie 0, a opłaty rzędu 30 dają przy tym samym współczynniku uczenia ogromne straty i nachylenia. Predykcje zamienia się z powrotem na złote za pomocą rozrzutu i średniej opłat.

## Jaki kształt ma waga środkowej warstwy `nn.Sequential(nn.Linear(2, 50), nn.ReLU(), nn.Linear(50, 40), nn.ReLU(), nn.Linear(40, 1))`?

- [x] `[40, 50]`
- [ ] `[50, 40]`
- [ ] `[40, 1]`
- [ ] `[2, 50]`

Waga ma kształt `[out_features, in_features]`, a środkowa warstwa przyjmuje 50 liczb i daje 40.
